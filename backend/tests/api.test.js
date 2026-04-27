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

// ─── Checklist Endpoint ───────────────────────────────────────────────────────

describe('GET /checklist/:stateCode', () => {
  it('should return 200 and correct structure for valid state "MH"', async () => {
    const response = await request(app).get('/checklist/MH');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('state', 'Maharashtra');
    expect(response.body).toHaveProperty('documents');
    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('boothUrl');
    expect(typeof response.body.boothUrl).toBe('string');
    expect(response.body).toHaveProperty('helpline');
    expect(typeof response.body.helpline).toBe('string');
  });

  it('should return 200 and correct structure for valid state "DL"', async () => {
    const response = await request(app).get('/checklist/DL');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('state', 'Delhi');
    expect(response.body).toHaveProperty('documents');
    expect(Array.isArray(response.body.documents)).toBe(true);
    expect(response.body.documents.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('boothUrl');
    expect(typeof response.body.boothUrl).toBe('string');
    expect(response.body).toHaveProperty('helpline');
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
    expect(response.body.error).toMatch(/Invalid state code format/i);
  });
});

// ─── Ask Endpoint (input validation only — no live Gemini call) ───────────────

describe('POST /ask — input validation', () => {
  it('should return 400 when "message" is missing', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ state: 'MH' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/message/i);
  });

  it('should return 400 when "state" is missing', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ message: 'What do I need to vote?' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/state/i);
  });

  it('should return 400 when both "message" and "state" are missing', async () => {
    const response = await request(app)
      .post('/ask')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

// ─── Data Integrity: regions.json ────────────────────────────────────────────

describe('regions.json data integrity', () => {
  it('should have at least 10 states', () => {
    const stateCodes = Object.keys(regions);
    expect(stateCodes.length).toBeGreaterThanOrEqual(10);
  });

  it('every state should have the required fields: name, documents, boothUrl, helpline', () => {
    const stateCodes = Object.keys(regions);

    stateCodes.forEach((code) => {
      const state = regions[code];

      expect(state).toHaveProperty('name');
      expect(typeof state.name).toBe('string');
      expect(state.name.length).toBeGreaterThan(0);

      expect(state).toHaveProperty('documents');
      expect(Array.isArray(state.documents)).toBe(true);
      expect(state.documents.length).toBeGreaterThan(0);

      expect(state).toHaveProperty('boothUrl');
      expect(typeof state.boothUrl).toBe('string');
      expect(state.boothUrl).toMatch(/^https?:\/\//);

      expect(state).toHaveProperty('helpline');
      expect(typeof state.helpline).toBe('string');
      expect(state.helpline.length).toBeGreaterThan(0);
    });
  });
});
