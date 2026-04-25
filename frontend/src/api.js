export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Sends a user message to the Gemini API via the backend server.
 * Includes a timeout of 10 seconds using AbortController.
 * 
 * @param {string} message - The text message from the user.
 * @param {string} state - The 2-letter state code.
 * @returns {Promise<Object>} The response payload containing the bot's reply.
 */
export const askAssistant = async (message, state) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
 * Fetches the required documents checklist and booth URL for a given state.
 * Includes a timeout of 10 seconds using AbortController.
 * 
 * @param {string} stateCode - The 2-letter state code.
 * @returns {Promise<Object>} The state's checklist data.
 */
export const fetchChecklist = async (stateCode) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
