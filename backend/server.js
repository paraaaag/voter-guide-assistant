require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MAX_MESSAGE_LENGTH, API_TIMEOUT, SUPPORTED_STATES } = require('./constants');

// Cache regions data in memory at startup to avoid repeated disk I/O
const regionsData = require('./regions.json');

// In-memory cache for /checklist responses (stateCode → serialised response object)
const checklistCache = new Map();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3001;

const GEMINI_SYSTEM_PROMPT =
  'You are a civic election assistant for Indian voters. The user is from {STATE_NAME}. ' +
  'Always reply in the exact same language the user wrote in. Keep answers under 4 sentences. ' +
  'Be factual, clear, and helpful. Do not make up election rules. ' +
  'If unsure, say so and direct the user to voters.eci.gov.in';

// ─── Middleware ───────────────────────────────────────────────────────────────

/** Enable gzip/deflate compression for all responses. */
app.use(compression());

/** Enable CORS for the hosted frontend and local dev server. */
app.use(cors({
  origin: ['https://promptwar-project.web.app', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

/** Parse JSON request bodies. */
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * Health-check endpoint.
 * Returns a simple status object to confirm the server is running.
 *
 * @param {express.Request}  request  - Incoming HTTP request (no body required).
 * @param {express.Response} response - Outgoing HTTP response.
 * @returns {void}
 */
app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

/**
 * Handles a user's civic question by forwarding it to the Gemini API
 * with state-specific context injected into the system prompt.
 *
 * Validates that both `message` and `state` are present in the request body,
 * and that `message` does not exceed {@link MAX_MESSAGE_LENGTH} characters.
 *
 * @param {express.Request}  request        - Incoming HTTP request.
 * @param {string}           request.body.message - The user's question text.
 * @param {string}           request.body.state   - Two-letter Indian state code.
 * @param {express.Response} response       - Outgoing HTTP response containing `{ reply }`.
 * @returns {Promise<void>}
 */
app.post('/ask', async (request, response) => {
  const { message, state } = request.body;

  if (!message || !state) {
    return response.status(400).json({ error: "Missing 'message' or 'state' in request body." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return response.status(400).json({
      error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`
    });
  }

  const stateData = regionsData[state];
  if (!stateData) {
    return response.status(400).json({ error: 'Invalid state code.' });
  }

  try {
    const systemInstruction = GEMINI_SYSTEM_PROMPT.replace('{STATE_NAME}', stateData.name);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction
    });

    const prompt =
      `User Message: ${message}\n\n` +
      `Context for state (${stateData.name}): ` +
      `ECI Booth URL: ${stateData.boothUrl}, ` +
      `Helpline: ${stateData.helpline}, ` +
      `Accepted Documents: ${stateData.documents.join(', ')}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    response.json({ reply });
  } catch (error) {
    console.error('Gemini API Error:', error);
    response.status(500).json({ error: 'Service unavailable. Please try again.' });
  }
});

/**
 * Returns the required voting documents and contact details for a specific state.
 * Results are served from an in-memory cache after the first request per state.
 *
 * Validates that `stateCode` is between 1 and 3 alphabetic characters.
 *
 * @param {express.Request}  request               - Incoming HTTP request.
 * @param {string}           request.params.stateCode - The Indian state code (e.g. "MH").
 * @param {express.Response} response              - Outgoing HTTP response containing state details.
 * @returns {void}
 */
app.get('/checklist/:stateCode', (request, response) => {
  const { stateCode } = request.params;

  if (!/^[a-zA-Z]{1,3}$/.test(stateCode)) {
    return response.status(400).json({ error: 'Invalid state code format. Must be up to 3 letters.' });
  }

  const normalizedCode = stateCode.toUpperCase();

  // Serve from cache if available
  if (checklistCache.has(normalizedCode)) {
    return response.json(checklistCache.get(normalizedCode));
  }

  const stateData = regionsData[normalizedCode];

  if (!stateData) {
    return response.status(404).json({ error: 'State not found' });
  }

  const payload = {
    state: stateData.name,
    documents: stateData.documents,
    boothUrl: stateData.boothUrl,
    helpline: stateData.helpline
  };

  // Store in cache for subsequent requests
  checklistCache.set(normalizedCode, payload);

  response.json(payload);
});

// ─── Start server (only when run directly) ───────────────────────────────────

if (require.main === module) {
  app.listen(port, () => {
    // Server started — port available via process.env.PORT
  });
}

module.exports = app;
