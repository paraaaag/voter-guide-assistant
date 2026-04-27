/**
 * @fileoverview Jest mock for ../firebase.js
 * Prevents real Firebase SDK initialisation during unit tests by replacing
 * the module with lightweight stubs. All exported values are jest.fn() so
 * tests can assert call counts and arguments without side-effects.
 */
export const analytics = {};
export const logEvent = jest.fn();
export const perf = {};
