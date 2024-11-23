// apiService.js

import pLimit from 'p-limit';

let apiUrls = [
    'https://wrldrad.loca.lt',
    'https://wrldrad24.loca.lt',
    'https://wrldrad1914.loca.lt',
    'http://22.ip.gl.ply.gg:18880',
    'http://23.ip.gl.ply.gg:65329',
];

const TIMEOUTS = [5000, 10000, 20000]; // Sequential timeouts for faster fallback
const CACHE_TTL = 5 * 60 * 1000; // Cache expiration in milliseconds
const serverTimings = new Map(); // To store response times for dynamic timeout
const cache = new Map(); // In-memory cache
const limit = pLimit(3); // Concurrency limiter for parallel requests
let metrics = { totalRequests: 0, successes: 0, failures: 0 }; // API metrics

/**
 * Helper to add a delay
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with timeout and retries using AbortController
 */
async function fetchWithRetries(url, options, timeout, retries = 3, backoff = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
            if (attempt < retries) await delay(backoff * attempt);
        }
    }
    throw new Error(`Failed after ${retries} attempts: ${url}`);
}

/**
 * Reorder API URLs based on response times
 */
async function reorderApiUrls() {
    try {
        const results = await Promise.allSettled(
            apiUrls.map(async (url) => {
                const startTime = Date.now();
                try {
                    await fetchWithRetries(`${url}/ping`, {}, 3000, 1);
                    const responseTime = Date.now() - startTime;
                    serverTimings.set(url, responseTime); // Update server timing
                    return { url, time: responseTime };
                } catch {
                    return { url, time: Infinity }; // Mark as unavailable
                }
            })
        );

        const successful = results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);

        apiUrls = successful.sort((a, b) => a.time - b.time).map(({ url }) => url);
        console.log('Reordered API URLs:', apiUrls);
    } catch (error) {
        console.error('Error reordering API URLs:', error.message);
    }
}

/**
 * Cache a response with expiration
 */
function cacheResponse(message, response) {
    const expiry = Date.now() + CACHE_TTL;
    cache.set(message, { response, expiry });
}

/**
 * Retrieve a cached response if valid
 */
function getCachedResponse(message) {
    const cached = cache.get(message);
    if (cached && Date.now() < cached.expiry) return cached.response;
    cache.delete(message); // Remove expired cache
    return null;
}

/**
 * Parse and validate API response
 */
async function parseResponse(response) {
    try {
        const data = await response.json();
        if (data && typeof data.response === 'string') return data.response;
        console.warn('Invalid API response schema:', data);
    } catch (error) {
        console.error('Error parsing JSON:', error.message);
    }
    return null;
}

/**
 * Send a message to the servers with parallel fallback and caching
 */
export async function sendMessageToServers(message) {
    const cachedResponse = getCachedResponse(message);
    if (cachedResponse) {
        console.log('Returning cached response for message:', message);
        return cachedResponse;
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ message }),
        mode: 'cors',
        credentials: 'include',
    };

    try {
        metrics.totalRequests++;
        const responses = apiUrls.map((url, index) =>
            limit(() =>
                fetchWithRetries(`${url}/api/message`, options, TIMEOUTS[index] || 45000)
            )
        );
        const response = await Promise.any(responses);

        if (response.ok) {
            const validatedResponse = await parseResponse(response);
            if (validatedResponse) {
                cacheResponse(message, validatedResponse); // Cache successful response
                metrics.successes++;
                return validatedResponse;
            }
        }
        console.warn('All servers responded, but none succeeded.');
    } catch (error) {
        metrics.failures++;
        console.error('Error with all APIs:', error.message);
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}

/**
 * Periodic API URL reordering
 */
setInterval(reorderApiUrls, 2 * 60 * 1000); // Reorder every 2 minutes
reorderApiUrls(); // Initial call

/**
 * Log metrics periodically
 */
setInterval(() => {
    console.log('API Metrics:', metrics);
}, 5 * 60 * 1000); // Log every 5 minutes

/**
 * Health check on startup
 */
(async function healthCheck() {
    console.log('Performing initial health check...');
    await Promise.allSettled(
        apiUrls.map(async (url) => {
            try {
                await fetchWithRetries(`${url}/ping`, {}, 3000, 1);
                console.log(`${url} is healthy.`);
            } catch {
                console.warn(`${url} is unhealthy.`);
            }
        })
    );
})();
