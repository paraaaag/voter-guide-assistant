import { askAssistant, fetchChecklist } from './api';

describe('api.js', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('askAssistant throws error on failed request', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    await expect(askAssistant('hello', 'MH')).rejects.toThrow();
  });

  it('fetchChecklist throws error on failed request', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    await expect(fetchChecklist('MH')).rejects.toThrow();
  });

  it('fetchChecklist returns data on success', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ state: 'Maharashtra', documents: [] })
    }));
    const result = await fetchChecklist('MH');
    expect(result.state).toBe('Maharashtra');
  });
});
