require('dotenv').config({ path: '../.env' }); // Load .env from parent directory
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const regions = require('./regions.json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3001;

const GEMINI_SYSTEM_PROMPT = "You are a civic election assistant for Indian voters. The user is from {STATE_NAME}. Always reply in the exact same language the user wrote in. Keep answers under 4 sentences. Be factual, clear, and helpful. Do not make up election rules. If unsure, say so and direct the user to voters.eci.gov.in";

// Enable CORS for frontend on port 5173 and production web.app
app.use(cors({
  origin: ['https://promptwar-project.web.app', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

/**
 * Health check endpoint to verify server is running.
 * 
 * @param {express.Request} request - The incoming HTTP request.
 * @param {express.Response} response - The outgoing HTTP response.
 */
app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

/**
 * Handles user questions by passing them to the Gemini API with state context.
 * 
 * @param {express.Request} request - The incoming HTTP request containing 'message' and 'state'.
 * @param {express.Response} response - The outgoing HTTP response containing 'reply'.
 * @returns {Promise<void>}
 */
app.post('/ask', async (request, response) => {
  const { message, state } = request.body;

  if (!message || !state) {
    return response.status(400).json({ error: "Missing 'message' or 'state' in request body." });
  }

  const stateData = regions[state];
  if (!stateData) {
    return response.status(400).json({ error: "Invalid state code." });
  }

  try {
    const systemInstruction = GEMINI_SYSTEM_PROMPT.replace('{STATE_NAME}', stateData.name);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const prompt = `User Message: ${message}\n\nContext for state (${stateData.name}): ECI Booth URL: ${stateData.boothUrl}, Helpline: ${stateData.helpline}, Accepted Documents: ${stateData.documents.join(', ')}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    response.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    response.status(500).json({ error: "Service unavailable. Please try again." });
  }
});

/**
 * Retrieves the required voting documents and details for a specific state.
 * 
 * @param {express.Request} request - The incoming HTTP request containing the 'stateCode' parameter.
 * @param {express.Response} response - The outgoing HTTP response containing state details.
 */
app.get('/checklist/:stateCode', (request, response) => {
  const { stateCode } = request.params;

  if (!/^[a-zA-Z]{1,3}$/.test(stateCode)) {
    return response.status(400).json({ error: "Invalid state code format. Must be up to 3 letters." });
  }

  const normalizedCode = stateCode.toUpperCase();
  const stateData = regions[normalizedCode];

  if (!stateData) {
    return response.status(404).json({ error: "State not found" });
  }

  response.json({
    state: stateData.name,
    documents: stateData.documents,
    boothUrl: stateData.boothUrl,
    helpline: stateData.helpline
  });
});

if (require.main === module) {
  app.listen(port, () => {
    // Intentionally removed console.log to comply with standard of only having console.log in catch blocks
  });
}

module.exports = app;
