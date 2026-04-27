/**
 * @fileoverview Unit tests for ChatInterface component.
 * Verifies empty-state rendering, message submission, analytics events,
 * Firebase Performance traces, loading indicators, and error handling.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';
import { askAssistant } from '../../api';
import { logEvent } from '../../firebase';
import { trace } from 'firebase/performance';

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty-state message when no state is selected', () => {
    render(<ChatInterface selectedState={null} />);
    expect(
      screen.getByText(/Please select a state on the Home screen first/i)
    ).toBeInTheDocument();
  });

  it('renders the initial bot greeting when state is provided', () => {
    render(<ChatInterface selectedState="MH" />);
    expect(
      screen.getByText(/Hello! I am your election assistant/i)
    ).toBeInTheDocument();
  });

  it('renders the text input and Send button', () => {
    render(<ChatInterface selectedState="MH" />);
    expect(screen.getByRole('textbox', { name: /type your message/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('Send button is disabled when input is empty', () => {
    render(<ChatInterface selectedState="MH" />);
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('Send button becomes enabled when user types a message', async () => {
    render(<ChatInterface selectedState="MH" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'What documents do I need?');
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
  });

  it('submits a message and displays the bot reply', async () => {
    askAssistant.mockResolvedValueOnce({ reply: 'You need a Voter ID card.' });

    render(<ChatInterface selectedState="MH" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'What do I need to vote?');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText('You need a Voter ID card.')).toBeInTheDocument();
    });
  });

  it('displays the user message in the chat log after submission', async () => {
    askAssistant.mockResolvedValueOnce({ reply: 'Bring your Voter ID.' });

    render(<ChatInterface selectedState="MH" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'What documents?');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText('What documents?')).toBeInTheDocument();
  });

  it('clears the input field after submission', async () => {
    askAssistant.mockResolvedValueOnce({ reply: 'Bring your ID.' });

    render(<ChatInterface selectedState="MH" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'Where is my booth?');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(input.value).toBe('');
  });

  it('fires question_asked analytics event on send', async () => {
    askAssistant.mockResolvedValueOnce({ reply: 'Test reply.' });

    render(<ChatInterface selectedState="MH" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'Test message');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(logEvent).toHaveBeenCalledWith(
      expect.anything(),
      'question_asked',
      { state: 'MH' }
    );
  });

  it('starts and stops a Firebase Performance trace on send', async () => {
    askAssistant.mockResolvedValueOnce({ reply: 'Reply text.' });
    const mockTrace = { putAttribute: jest.fn(), start: jest.fn(), stop: jest.fn() };
    trace.mockReturnValueOnce(mockTrace);

    render(<ChatInterface selectedState="DL" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'Hindi question');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(trace).toHaveBeenCalledWith(expect.anything(), 'ai_response_time');
      expect(mockTrace.putAttribute).toHaveBeenCalledWith('state', 'DL');
      expect(mockTrace.start).toHaveBeenCalled();
      expect(mockTrace.stop).toHaveBeenCalled();
    });
  });

  it('shows error message when API call fails', async () => {
    askAssistant.mockRejectedValueOnce(new Error('Network error'));

    render(<ChatInterface selectedState="MH" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'Will this fail?');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/having trouble right now/i)).toBeInTheDocument();
    });
  });

  it('stops the performance trace even when API call fails', async () => {
    askAssistant.mockRejectedValueOnce(new Error('Timeout'));
    const mockTrace = { putAttribute: jest.fn(), start: jest.fn(), stop: jest.fn() };
    trace.mockReturnValueOnce(mockTrace);

    render(<ChatInterface selectedState="KA" />);
    const input = screen.getByRole('textbox', { name: /type your message/i });
    await userEvent.type(input, 'Error test');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockTrace.stop).toHaveBeenCalled();
    });
  });
});
