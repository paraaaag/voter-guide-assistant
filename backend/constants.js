/**
 * @fileoverview Shared constants for the VoteEasy backend server.
 */

/** Maximum allowed length (in characters) for a user message sent to /ask. */
const MAX_MESSAGE_LENGTH = 500;

/** API timeout in milliseconds for downstream service calls. */
const API_TIMEOUT = 10000;

/** List of all supported Indian state codes. */
const SUPPORTED_STATES = [
  'AP', 'BR', 'DL', 'GJ', 'KA',
  'MP', 'MH', 'RJ', 'TN', 'UP', 'WB'
];

module.exports = { MAX_MESSAGE_LENGTH, API_TIMEOUT, SUPPORTED_STATES };
