import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock child components so we just test the App routing and Suspense
jest.mock('../StateSelector', () => {
  return function MockStateSelector({ onStateSelect, navigateTo }) {
    return (
      <div data-testid="state-selector">
        State Selector
        <button onClick={() => { onStateSelect('MH'); navigateTo('chat'); }}>Select MH</button>
      </div>
    );
  };
});
jest.mock('../ChatInterface', () => () => <div data-testid="chat-interface">Chat Interface</div>);
jest.mock('../Checklist', () => () => <div data-testid="checklist">Checklist</div>);
jest.mock('../BoothFinder', () => () => <div data-testid="booth-finder">Booth Finder</div>);

describe('App', () => {
  it('renders without crashing and shows the skip navigation link', () => {
    render(<App />);
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
    expect(screen.getByText(/VoteEasy/i)).toBeInTheDocument();
  });

  it('renders StateSelector by default on the home page', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('state-selector')).toBeInTheDocument();
    });
  });

  it('initially disables Chat, Checklist, and Booth Finder navigation buttons', () => {
    render(<App />);
    const chatBtn = screen.getByRole('button', { name: /Navigate to Chat/i });
    const checklistBtn = screen.getByRole('button', { name: /Navigate to Checklist/i });
    const boothBtn = screen.getByRole('button', { name: /Navigate to Booth Finder/i });
    
    expect(chatBtn).toBeDisabled();
    expect(checklistBtn).toBeDisabled();
    expect(boothBtn).toBeDisabled();
  });

  it('enables navigation and navigates to Chat when a state is selected', async () => {
    render(<App />);
    
    // Wait for the lazy loaded StateSelector
    const selectBtn = await screen.findByText('Select MH');
    
    // Selecting the state and navigating to chat (as implemented in our mock)
    fireEvent.click(selectBtn);

    // Verify Chat is displayed
    await waitFor(() => {
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
    });

    // The nav buttons should now be enabled
    expect(screen.getByRole('button', { name: /Navigate to Chat/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Navigate to Checklist/i })).not.toBeDisabled();
  });

  it('can navigate between tabs via the navbar', async () => {
    render(<App />);
    
    // Select state to enable tabs
    const selectBtn = await screen.findByText('Select MH');
    fireEvent.click(selectBtn);

    // Navigate to Checklist
    const checklistNav = screen.getByRole('button', { name: /Navigate to Checklist/i });
    fireEvent.click(checklistNav);
    await waitFor(() => {
      expect(screen.getByTestId('checklist')).toBeInTheDocument();
    });

    // Navigate to Booth Finder
    const boothNav = screen.getByRole('button', { name: /Navigate to Booth Finder/i });
    fireEvent.click(boothNav);
    await waitFor(() => {
      expect(screen.getByTestId('booth-finder')).toBeInTheDocument();
    });
    
    // Navigate back to Home
    const homeNav = screen.getByRole('button', { name: /Navigate to Home/i });
    fireEvent.click(homeNav);
    await waitFor(() => {
      expect(screen.getByTestId('state-selector')).toBeInTheDocument();
    });
  });
});
