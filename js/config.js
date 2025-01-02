// src/config.js
export const API_URL = process.env.API_URL || 'http://22.ip.gl.ply.gg:18880';
export const TIMEOUT = 15000;
export const MAX_BACKOFF = 10000;  // Max backoff time (10 seconds)
export const RETRIES = 3;
export const BACKOFF = 2000;  // Initial backoff time (2 seconds)
