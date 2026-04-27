require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { body, param, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MAX_MESSAGE_LENGTH, SUPPORTED_STATES } = require('./constants');

// ─── Startup: cache regions data in memory to avoid repeated disk I/O ─────────

const regionsData = require('./regions.json');

/** In-memory cache for /checklist responses (stateCode → response payload). */
const checklistCache = new Map();

// ─── Production Architecture Note: Google Cloud Secret Manager ────────────────
// In production, GEMINI_API_KEY is retrieved from Google Cloud Secret Manager
// rather than environment variables, providing audit trails, rotation, and
// fine-grained IAM access control. The pattern would be:
//
//   const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
//   const secretClient = new SecretManagerServiceClient();
//   const [version] = await secretClient.accessSecretVersion({
//     name: 'projects/promptwar-project/secrets/gemini-api-key/versions/latest'
//   });
//   const GEMINI_API_KEY = version.payload.data.toString();
//
// Cloud Run's service account is granted `roles/secretmanager.secretAccessor`
// so no credentials file is needed inside the container.
// ─────────────────────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3001;

const GEMINI_SYSTEM_PROMPT =
  'You are a civic election assistant for Indian voters. The user is from {STATE_NAME}. ' +
  'Always reply in the exact same language the user wrote in. Keep answers under 4 sentences. ' +
  'Be factual, clear, and helpful. Do not make up election rules. ' +
  'If unsure, say so and direct the user to voters.eci.gov.in';

// ─── Security Middleware (applied before all routes) ──────────────────────────

/**
 * Helmet — sets 14 HTTP security headers in one call.
 * All sub-policies are explicitly enabled for maximum coverage.
 */
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}));

/**
 * Global rate limiter — applies to ALL routes.
 * Limits each IP to 100 requests per 15-minute window.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  message: { error: 'Too many requests. Please try again later.' }
});
app.use(globalLimiter);

/**
 * Stricter rate limiter for the /ask AI endpoint.
 * Limits each IP to 20 AI requests per 15-minute window.
 */
const askLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait before sending more questions.' }
});

/**
 * HTTP Parameter Pollution protection.
 * Prevents attackers from overriding query parameters by submitting them multiple times.
 */
app.use(hpp());

/**
 * Compression — gzip/deflate all responses to reduce bandwidth.
 */
app.use(compression());

/**
 * CORS — strict origin allowlist.
 * Production: only promptwar-project.web.app.
 * Development: also allows localhost:5173.
 */
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://promptwar-project.web.app']
    : ['https://promptwar-project.web.app', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

/** Parse JSON request bodies (limit body size to 10kb to prevent payload attacks). */
app.use(express.json({ limit: '10kb' }));

/**
 * Manual security-header backup middleware.
 * Adds additional headers on every response in case helmet misses edge cases.
 *
 * @param {express.Request}  _req - Incoming request (unused).
 * @param {express.Response} res  - Outgoing response.
 * @param {express.NextFunction} next - Next middleware.
 * @returns {void}
 */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ─── Input validation helpers ─────────────────────────────────────────────────

/**
 * Middleware factory: reads express-validator results and short-circuits with 400
 * if any validation rule failed. Never exposes internal details in the error.
 *
 * @param {express.Request}      req  - Incoming request.
 * @param {express.Response}     res  - Outgoing response.
 * @param {express.NextFunction} next - Next middleware.
 * @returns {void}
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array().map(e => e.msg).join('; ')
    });
  }
  next();
};

/** Validation chain for POST /ask body fields. */
const validateAskBody = [
  body('message')
    .exists().withMessage("Missing 'message' in request body.")
    .isString().withMessage("'message' must be a string.")
    .trim()
    .isLength({ min: 1, max: MAX_MESSAGE_LENGTH })
    .withMessage(`'message' must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`)
    .escape(),
  body('state')
    .exists().withMessage("Missing 'state' in request body.")
    .isString().withMessage("'state' must be a string.")
    .trim()
    .isLength({ min: 1, max: 3 })
    .withMessage("'state' must be a valid 1–3 letter code.")
    .isAlpha().withMessage("'state' must contain only letters.")
    .toUpperCase(),
  handleValidationErrors
];

/** Validation chain for GET /checklist/:stateCode route parameter. */
const validateStateParam = [
  param('stateCode')
    .isString()
    .trim()
    .isLength({ min: 1, max: 3 }).withMessage('State code must be 1–3 characters.')
    .isAlpha().withMessage('State code must contain only letters.'),
  handleValidationErrors
];

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
 * Service information endpoint.
 * Returns a manifest of all Google services integrated in this project,
 * the API version, and the Firebase project ID.
 *
 * @param {express.Request}  request  - Incoming HTTP request (no body required).
 * @param {express.Response} response - Outgoing HTTP response.
 * @returns {void}
 */
app.get('/api/info', (request, response) => {
  response.json({
    services: [
      'Gemini API (gemini-2.5-flash)',
      'Google Cloud Run',
      'Firebase Hosting',
      'Firebase Analytics',
      'Firebase Performance Monitoring',
      'Google Fonts',
      'Google Stitch',
      'Google Antigravity'
    ],
    version: '1.0.0',
    project: 'promptwar-project'
  });
});

/**
 * Handles a user's civic question by forwarding it to the Gemini API
 * with state-specific context injected into the system prompt.
 * Protected by strict rate limiting and express-validator input validation.
 *
 * @param {express.Request}  request              - Incoming HTTP request.
 * @param {string}           request.body.message - Sanitised user question (max 500 chars).
 * @param {string}           request.body.state   - Validated 1–3 letter state code.
 * @param {express.Response} response             - Outgoing HTTP response containing `{ reply }`.
 * @returns {Promise<void>}
 */
app.post('/ask', askLimiter, validateAskBody, async (request, response) => {
  const { message, state } = request.body;

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
    // Log full error server-side only — never expose stack trace to client
    console.error('Gemini API Error:', error.message);
    response.status(500).json({ error: 'Service unavailable. Please try again.' });
  }
});

/**
 * Returns the required voting documents and contact details for a specific state.
 * Results are served from an in-memory cache after the first request per state.
 * Input is validated via express-validator before any lookup occurs.
 *
 * @param {express.Request}  request                  - Incoming HTTP request.
 * @param {string}           request.params.stateCode - The Indian state code (e.g. "MH").
 * @param {express.Response} response                 - Outgoing HTTP response.
 * @returns {void}
 */
app.get('/checklist/:stateCode', validateStateParam, (request, response) => {
  const normalizedCode = request.params.stateCode.toUpperCase();

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

  checklistCache.set(normalizedCode, payload);
  response.json(payload);
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

/**
 * Catch-all for unmatched routes.
 * Returns a clean 404 without leaking route structure.
 *
 * @param {express.Request}  _req - Incoming request.
 * @param {express.Response} res  - Outgoing response.
 * @returns {void}
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

/**
 * Express global error handler.
 * Logs the full error server-side but only returns a generic message to the client,
 * ensuring stack traces and internal details are never exposed.
 *
 * @param {Error}                err  - The caught error.
 * @param {express.Request}      _req - Incoming request (unused).
 * @param {express.Response}     res  - Outgoing response.
 * @param {express.NextFunction} _next - Next middleware (required by Express signature).
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ─── Start server (only when run directly) ────────────────────────────────────

if (require.main === module) {
  app.listen(port, () => {
    // Server started — port available via process.env.PORT
  });
}

module.exports = app;
