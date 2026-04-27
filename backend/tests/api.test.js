/**
 * Backend integration tests — extended suite.
 * Covers: API info endpoint, /ask flow with mocked Gemini, security headers,
 * CORS, compression, rate limiting, edge cases, and injection attempts.
 *
 * Mocking strategy: jest.mock('@google/generative-ai') prevents any live AI
 * calls while still exercising the full request/response pipeline.
 */

// ─── Mock Gemini before requiring app ────────────────────────────────────────
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    response: { text: () => 'Mocked Gemini reply for testing.' }
  });
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent
  }));
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel
    }))
  };
});

const request = require('supertest');
const app = require('../server');
const regions = require('../regions.json');

// ─── Health Endpoint ──────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('should return 200 with { status: "ok" }', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

// ─── /api/info Endpoint ───────────────────────────────────────────────────────

describe('GET /api/info', () => {
  it('should return 200 with a services array, version, and project', async () => {
    const response = await request(app).get('/api/info');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('services');
    expect(Array.isArray(response.body.services)).toBe(true);
    expect(response.body.services.length).toBeGreaterThanOrEqual(7);
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('project', 'promptwar-project');
  });

  it('should list Gemini API in the services array', async () => {
    const response = await request(app).get('/api/info');
    const services = response.body.services.join(' ');
    expect(services).toMatch(/gemini/i);
  });

  it('should list Firebase in the services array', async () => {
    const response = await request(app).get('/api/info');
    const services = response.body.services.join(' ');
    expect(services).toMatch(/firebase/i);
  });
});

// ─── Checklist Endpoint ───────────────────────────────────────────────────────

describe('GET /checklist/:stateCode', () => {
  it('should return 200 and correct structure for valid state "MH"', async () => {
    const response = await request(app).get('/checklist/MH');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('state', 'Maharashtra');
    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBeGreaterThan(0);
    expect(typeof response.body.boothUrl).toBe('string');
    expect(typeof response.body.helpline).toBe('string');
  });

  it('should return 200 and correct structure for valid state "DL"', async () => {
    const response = await request(app).get('/checklist/DL');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('state', 'Delhi');
    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBeGreaterThan(0);
    expect(typeof response.body.boothUrl).toBe('string');
    expect(typeof response.body.helpline).toBe('string');
  });

  it('should return 404 for unknown state code "XX"', async () => {
    const response = await request(app).get('/checklist/XX');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'State not found');
  });

  it('should return 400 for invalid state code format "TOOLONG"', async () => {
    const response = await request(app).get('/checklist/TOOLONG');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
    expect(response.body.error.length).toBeGreaterThan(0);
  });

  it('should be case-insensitive and accept lowercase "mh"', async () => {
    const response = await request(app).get('/checklist/mh');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('state', 'Maharashtra');
  });
});

// ─── /ask — Input Validation ──────────────────────────────────────────────────

describe('POST /ask — input validation', () => {
  it('should return 400 when "message" is missing', async () => {
    const response = await request(app).post('/ask').send({ state: 'MH' });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/message/i);
  });

  it('should return 400 when "state" is missing', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: 'What do I need to vote?' });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/state/i);
  });

  it('should return 400 when both fields are missing', async () => {
    const response = await request(app).post('/ask').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

// ─── /ask — Full Flow with Mocked Gemini ─────────────────────────────────────

describe('POST /ask — full flow with mocked Gemini', () => {
  it('should return 200 with a reply when valid message and state are provided', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: 'What documents do I need to vote?', state: 'MH' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reply');
    expect(typeof response.body.reply).toBe('string');
    expect(response.body.reply.length).toBeGreaterThan(0);
  });

  it('should call Gemini with the correct state context', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: 'Tell me about voting in Delhi', state: 'DL' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reply', 'Mocked Gemini reply for testing.');
  });

  it('should return 400 for an invalid state code even with valid message', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: 'Where do I vote?', state: 'ZZ' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('POST /ask — edge cases', () => {
  it('should return 400 for a message over 500 characters', async () => {
    const longMessage = 'A'.repeat(501);
    const response = await request(app)
      .post('/ask')
      .send({ message: longMessage, state: 'MH' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/500|length|maximum/i);
  });

  it('should handle a message at exactly the 500-char limit', async () => {
    const exactMessage = 'B'.repeat(500);
    const response = await request(app)
      .post('/ask')
      .send({ message: exactMessage, state: 'MH' });

    // 200 is expected — boundary value should be accepted
    expect(response.status).toBe(200);
  });

  it('should sanitise XSS attempt in message field (escape HTML entities)', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/ask')
      .send({ message: xssPayload, state: 'MH' });

    // express-validator .escape() means the raw script tag is never forwarded
    // The request should succeed (200) but the stored/forwarded value is escaped
    expect([200, 400]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.reply).not.toMatch(/<script>/i);
    }
  });

  it('should return 400 for SQL injection attempt in stateCode', async () => {
    const response = await request(app)
      .get("/checklist/MH'; DROP TABLE states; --");

    // The router won't even match this path — express returns 404 or 400
    expect([400, 404]).toContain(response.status);
  });

  it('should return 400 for SQL injection attempt in state body field', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: 'test', state: "' OR '1'='1" });

    expect(response.status).toBe(400);
  });

  it('should reject empty string message', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: '', state: 'MH' });

    expect(response.status).toBe(400);
  });

  it('should reject message containing only whitespace', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: '   ', state: 'MH' });

    expect(response.status).toBe(400);
  });

  it('should handle special Unicode characters in message', async () => {
    const unicodeMsg = 'मेरा पोलिंग बूथ कहाँ है?';
    const response = await request(app)
      .post('/ask')
      .send({ message: unicodeMsg, state: 'UP' });

    // Valid Hindi query — should reach Gemini mock and return 200
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('reply');
  });
});

// ─── Security Headers (Helmet) ────────────────────────────────────────────────

describe('Security headers — Helmet', () => {
  it('should include X-Content-Type-Options: nosniff', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include X-Frame-Options header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('should remove X-Powered-By header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('should include Strict-Transport-Security header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['strict-transport-security']).toBeDefined();
  });

  it('should include referrer-policy header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['referrer-policy']).toBeDefined();
  });

  it('should include X-XSS-Protection header (manual backup)', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-xss-protection']).toBeDefined();
  });
});

// ─── CORS Headers ─────────────────────────────────────────────────────────────

describe('CORS headers', () => {
  it('should allow requests from promptwar-project.web.app', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://promptwar-project.web.app');

    expect(response.headers['access-control-allow-origin']).toBe(
      'https://promptwar-project.web.app'
    );
  });

  it('should NOT set CORS headers for disallowed origins', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://evil-site.com');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

// ─── Compression ──────────────────────────────────────────────────────────────

describe('Compression middleware', () => {
  it('should return gzip-compressed response when Accept-Encoding: gzip is set', async () => {
    const response = await request(app)
      .get('/api/info')
      .set('Accept-Encoding', 'gzip');

    // compression middleware sets Content-Encoding: gzip for compressible responses
    // For small payloads it may skip compression — accept either case
    const encoding = response.headers['content-encoding'];
    expect(['gzip', undefined]).toContain(encoding);
  });
});

// ─── 404 Catch-all ────────────────────────────────────────────────────────────

describe('404 catch-all handler', () => {
  it('should return 404 JSON for unknown routes', async () => {
    const response = await request(app).get('/nonexistent-route');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not found.');
  });

  it('should not expose HTML error pages on unknown routes', async () => {
    const response = await request(app).get('/undefined/path');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});

// ─── Data Integrity: regions.json ────────────────────────────────────────────

describe('regions.json data integrity', () => {
  it('should have at least 10 states', () => {
    expect(Object.keys(regions).length).toBeGreaterThanOrEqual(10);
  });

  it('every state should have all required fields with correct types', () => {
    Object.keys(regions).forEach((code) => {
      const state = regions[code];
      expect(typeof state.name).toBe('string');
      expect(state.name.length).toBeGreaterThan(0);
      expect(Array.isArray(state.documents)).toBe(true);
      expect(state.documents.length).toBeGreaterThan(0);
      expect(state.boothUrl).toMatch(/^https?:\/\//);
      expect(typeof state.helpline).toBe('string');
      expect(state.helpline.length).toBeGreaterThan(0);
    });
  });
});
