/**
 * Jest setup file for frontend component tests.
 * Imports @testing-library/jest-dom matchers (toBeInTheDocument, toBeDisabled, etc.)
 * and polyfills JSDOM APIs that are missing from the test environment.
 */
import '@testing-library/jest-dom';

// JSDOM does not implement scrollIntoView — polyfill it so components
// that call element.scrollIntoView() don't throw during tests.
window.HTMLElement.prototype.scrollIntoView = function () {};
