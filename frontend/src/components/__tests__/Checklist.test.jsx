/**
 * @fileoverview Unit tests for Checklist component.
 * Verifies empty-state, loading state, document rendering, analytics event,
 * error handling, and share button behaviour.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checklist from '../Checklist';
import { fetchChecklist } from '../../api';
import { logEvent } from '../../firebase';

const MOCK_CHECKLIST = {
  state: 'Maharashtra',
  documents: ['EPIC (Voter ID Card)', 'Aadhaar Card', 'PAN Card'],
  helpline: '1950',
  boothUrl: 'https://voters.eci.gov.in'
};

describe('Checklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty-state prompt when no state is selected', () => {
    render(<Checklist selectedState={null} />);
    expect(
      screen.getByText(/Please select a state on the Home screen first/i)
    ).toBeInTheDocument();
  });

  it('shows loading text while fetching', () => {
    // Never resolve so we stay in loading state
    fetchChecklist.mockReturnValueOnce(new Promise(() => {}));
    render(<Checklist selectedState="MH" />);
    expect(screen.getByText(/Loading checklist/i)).toBeInTheDocument();
  });

  it('renders document list after successful fetch', async () => {
    fetchChecklist.mockResolvedValueOnce(MOCK_CHECKLIST);
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      expect(screen.getByText('EPIC (Voter ID Card)')).toBeInTheDocument();
      expect(screen.getByText('Aadhaar Card')).toBeInTheDocument();
      expect(screen.getByText('PAN Card')).toBeInTheDocument();
    });
  });

  it('renders state name in the heading', async () => {
    fetchChecklist.mockResolvedValueOnce(MOCK_CHECKLIST);
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      expect(screen.getByText(/Required Documents for Maharashtra/i)).toBeInTheDocument();
    });
  });

  it('renders helpline number as a tel: link', async () => {
    fetchChecklist.mockResolvedValueOnce(MOCK_CHECKLIST);
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      const helplineLink = screen.getByRole('link', { name: '1950' });
      expect(helplineLink).toHaveAttribute('href', 'tel:1950');
    });
  });

  it('renders a checkbox for each document', async () => {
    fetchChecklist.mockResolvedValueOnce(MOCK_CHECKLIST);
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(MOCK_CHECKLIST.documents.length);
    });
  });

  it('fires checklist_viewed analytics event after data loads', async () => {
    fetchChecklist.mockResolvedValueOnce(MOCK_CHECKLIST);
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'checklist_viewed',
        { state: 'MH' }
      );
    });
  });

  it('shows error message when fetch fails', async () => {
    fetchChecklist.mockRejectedValueOnce(new Error('Failed to fetch checklist'));
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch checklist/i)).toBeInTheDocument();
    });
  });

  it('renders the Share button', async () => {
    fetchChecklist.mockResolvedValueOnce(MOCK_CHECKLIST);
    render(<Checklist selectedState="MH" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /share checklist/i })).toBeInTheDocument();
    });
  });

  it('refetches when selectedState changes', async () => {
    const delhiChecklist = { ...MOCK_CHECKLIST, state: 'Delhi' };
    fetchChecklist
      .mockResolvedValueOnce(MOCK_CHECKLIST)
      .mockResolvedValueOnce(delhiChecklist);

    const { rerender } = render(<Checklist selectedState="MH" />);
    await waitFor(() => screen.getByText(/Maharashtra/i));

    rerender(<Checklist selectedState="DL" />);
    await waitFor(() => screen.getByText(/Delhi/i));

    expect(fetchChecklist).toHaveBeenCalledTimes(2);
    expect(fetchChecklist).toHaveBeenNthCalledWith(1, 'MH');
    expect(fetchChecklist).toHaveBeenNthCalledWith(2, 'DL');
  });
});
