/**
 * @fileoverview Frontend API helpers for VoteEasy.
 * All requests include a configurable AbortController timeout to prevent hanging fetches.
 */

/** Base URL for the backend API, configurable via environment variable. */
export const API_URL = import.meta.env.VITE_API_URL || 'https://voter-guide-api-360693077440.us-central1.run.app';

/** Timeout in milliseconds applied to all API requests via AbortController. */
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Sends a user message to the Gemini-powered backend `/ask` endpoint.
 * Automatically aborts the request after {@link REQUEST_TIMEOUT_MS} milliseconds.
 *
 * @param {string} message   - The user's civic question text.
 * @param {string} state     - Two-letter ECI state code (e.g. "MH").
 * @returns {Promise<{reply: string}>} Resolved with the assistant's reply text.
 * @throws {Error} If the request times out, the network fails, or the server returns an error.
 */
export const askAssistant = async (message, state) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, state }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.error || 'Failed to communicate with assistant');
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }
    throw error;
  }
};

/**
 * Fetches the required voting documents, booth URL, and helpline number
 * for the given state from the backend `/checklist/:stateCode` endpoint.
 * Automatically aborts the request after {@link REQUEST_TIMEOUT_MS} milliseconds.
 *
 * @param {string} stateCode - Two-letter ECI state code (e.g. "DL").
 * @returns {Promise<{state: string, documents: string[], boothUrl: string, helpline: string}>}
 *   Resolved with the state's checklist data.
 * @throws {Error} If the request times out, the network fails, or the state is not found.
 */
export const fetchChecklist = async (stateCode) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/checklist/${stateCode}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.error || 'Failed to fetch checklist');
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }
    throw error;
  }
};
