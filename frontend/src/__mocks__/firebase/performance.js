/**
 * @fileoverview Jest mock for firebase/performance
 * Stubs getPerformance and trace so ChatInterface tests don't hit the real SDK.
 */
export const getPerformance = jest.fn(() => ({}));
export const trace = jest.fn(() => ({
  putAttribute: jest.fn(),
  start: jest.fn(),
  stop: jest.fn()
}));
