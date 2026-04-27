/**
 * @fileoverview Jest mock for ../api.js
 * Replaces the real fetch-based helpers with jest.fn() stubs so component
 * tests never make real HTTP requests. Tests configure return values per-test
 * using mockResolvedValue / mockRejectedValue.
 */
export const askAssistant = jest.fn();
export const fetchChecklist = jest.fn();
export const API_URL = 'http://localhost:3001';
