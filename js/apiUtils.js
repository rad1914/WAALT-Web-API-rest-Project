// apiUtils.js

export const apiUrls = [
    'https://wrldrad.loca.lt',
    'https://wrldrad24.loca.lt',
    'https://wrldrad1914.loca.lt',
    'http://22.ip.gl.ply.gg:18880',
    'http://23.ip.gl.ply.gg:65329',
];

export const TIMEOUTS = [5000, 10000, 20000];
export const CACHE_TTL = 5 * 60 * 1000; // Cache expiration in milliseconds

export const serverTimings = new Map();
export const cache = new Map();
export const metrics = { totalRequests: 0, successes: 0, failures: 0 };

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with retries and timeout
 */
export async function fetchWithRetries(url, options = {}, timeout = 3000, retries = 3, backoff = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeoutId);
            return response;
        } catch {
            if (attempt < retries) await delay(backoff * attempt);
        }
    }
    throw new Error(`Failed after ${retries} attempts: ${url}`);
}

/**
 * Handle cache: get or set response with expiration
 */
export function handleCache(key, value = null) {
    if (value) {
        cache.set(key, { value, expiry: Date.now() + CACHE_TTL });
    } else {
        const cached = cache.get(key);
        if (cached && Date.now() < cached.expiry) return cached.value;
        cache.delete(key);
    }
    return null;
}

/**
 * Parse and validate response
 */
export async function parseResponse(response) {
    try {
        const data = await response.json();
        return data?.response || null;
    } catch (error) {
        console.error('Error parsing response:', error.message);
        return null;
    }
}