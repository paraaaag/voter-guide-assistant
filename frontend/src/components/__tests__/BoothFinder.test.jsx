import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BoothFinder from '../BoothFinder';
import { fetchChecklist } from '../../api';

describe('BoothFinder', () => {
  it('shows empty state prompt when no state is selected', () => {
    render(<BoothFinder selectedState={null} />);
    expect(screen.getByText(/Please select a state/i)).toBeInTheDocument();
  });
  
  it('renders booth finder content when state is selected', async () => {
    fetchChecklist.mockResolvedValueOnce({ boothUrl: 'https://voters.eci.gov.in' });
    render(<BoothFinder selectedState="MH" />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });
});
