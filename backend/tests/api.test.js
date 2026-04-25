const request = require('supertest');
const app = require('../server');
const regions = require('../regions.json');

describe('API Tests', () => {
  describe('regions.json', () => {
    it('should load correctly and have at least one state with required fields', () => {
      const keys = Object.keys(regions);
      expect(keys.length).toBeGreaterThan(0);
      
      const firstState = regions[keys[0]];
      expect(firstState).toHaveProperty('name');
      expect(firstState).toHaveProperty('documents');
      expect(Array.isArray(firstState.documents)).toBe(true);
      expect(firstState).toHaveProperty('boothUrl');
      expect(firstState).toHaveProperty('helpline');
    });
  });

  describe('GET /checklist/:stateCode', () => {
    it('should return 200 and correct structure for a valid state code like "MH"', async () => {
      const response = await request(app).get('/checklist/MH');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('state', 'Maharashtra');
      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
      expect(response.body).toHaveProperty('boothUrl');
      expect(response.body).toHaveProperty('helpline');
    });

    it('should return 404 for an invalid state code like "XX"', async () => {
      const response = await request(app).get('/checklist/XX');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'State not found');
    });
  });
});
