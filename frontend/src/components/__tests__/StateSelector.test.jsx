/**
 * @fileoverview Unit tests for StateSelector component.
 * Verifies rendering, state list population, button disabled state,
 * selection behaviour, and analytics event dispatch.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StateSelector from '../StateSelector';
import { logEvent } from '../../firebase';

// CSS modules → identity-obj-proxy returns className strings as-is
// (configured in jest config)

describe('StateSelector', () => {
  const mockOnStateSelect = jest.fn();
  const mockNavigateTo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading and description', () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    expect(screen.getByText('Select Your State')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to VoteEasy/i)).toBeInTheDocument();
  });

  it('renders a dropdown with all 11 Indian states', () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // 11 states + 1 disabled placeholder = 12 options
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(12);
  });

  it('renders Get Started button as disabled initially', () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeDisabled();
  });

  it('enables Get Started button after a state is selected', async () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'MH');

    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).not.toBeDisabled();
  });

  it('calls onStateSelect and navigateTo when Get Started is clicked', async () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'DL');

    const button = screen.getByRole('button', { name: /get started/i });
    await userEvent.click(button);

    expect(mockOnStateSelect).toHaveBeenCalledWith('DL');
    expect(mockNavigateTo).toHaveBeenCalledWith('chat');
  });

  it('does not call onStateSelect when no state is selected', async () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    const button = screen.getByRole('button', { name: /get started/i });
    // Button is disabled — click should not fire
    fireEvent.click(button);
    expect(mockOnStateSelect).not.toHaveBeenCalled();
  });

  it('fires a page_view analytics event on mount', () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.anything(),
      'page_view',
      { page_title: 'StateSelector' }
    );
  });

  it('renders Maharashtra as a selectable option', () => {
    render(
      <StateSelector onStateSelect={mockOnStateSelect} navigateTo={mockNavigateTo} />
    );
    expect(screen.getByRole('option', { name: 'Maharashtra' })).toBeInTheDocument();
  });
});
