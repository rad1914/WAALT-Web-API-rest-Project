// apiService.js

import pLimit from 'p-limit';

let apiUrls = [
    'https://wrldrad.loca.lt',
    'https://wrldrad24.loca.lt',
    'https://wrldrad1914.loca.lt',
    'http://22.ip.gl.ply.gg:18880',
    'http://23.ip.gl.ply.gg:65329',
];

const TIMEOUTS = [5000, 10000, 20000];
const CACHE_TTL = 5 * 60 * 1000; // Cache expiration in milliseconds
const serverTimings = new Map();
const cache = new Map();
const limit = pLimit(3);

let metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with retries and timeout
 */
async function fetchWithRetries(url, options = {}, timeout = 3000, retries = 3, backoff = 1000) {
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
            if (attempt < retries) await delay(backoff * attempt);
        }
    }
    throw new Error(`Failed after ${retries} attempts: ${url}`);
}

/**
 * Handle cache: get, set, and auto-remove expired entries
 */
function handleCache(message, response = null) {
    if (response) {
        const expiry = Date.now() + CACHE_TTL;
        cache.set(message, { response, expiry });
        return;
    }
    const cached = cache.get(message);
    if (cached && Date.now() < cached.expiry) return cached.response;
    cache.delete(message);
    return null;
}

/**
 * Reorder API URLs based on response times
 */
async function reorderApiUrls() {
    const results = await Promise.allSettled(
        apiUrls.map(async (url) => {
            try {
                const startTime = Date.now();
                await fetchWithRetries(`${url}/ping`, {}, 3000, 1);
                const responseTime = Date.now() - startTime;
                serverTimings.set(url, responseTime);
                return { url, time: responseTime };
            } catch {
                return { url, time: Infinity };
            }
        })
    );

    apiUrls = results
        .filter((result) => result.status === 'fulfilled' && result.value.time !== Infinity)
        .sort((a, b) => a.value.time - b.value.time)
        .map((result) => result.value.url);

    console.log('Reordered API URLs:', apiUrls);
}

/**
 * Parse API response
 */
async function parseResponse(response) {
    try {
        const data = await response.json();
        if (data?.response) return data.response;
    } catch (error) {
        console.error('Error parsing response:', error.message);
    }
    return null;
}

/**
 * Send message to servers with caching and fallback
 */
export async function sendMessageToServers(message) {
    const cachedResponse = handleCache(message);
    if (cachedResponse) return cachedResponse;

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ message }),
        mode: 'cors',
        credentials: 'include',
    };

    metrics.totalRequests++;
    try {
        const responses = apiUrls.map((url, index) =>
            limit(() => fetchWithRetries(`${url}/api/message`, options, TIMEOUTS[index] || 45000))
        );
        const response = await Promise.any(responses);

        if (response.ok) {
            const validatedResponse = await parseResponse(response);
            if (validatedResponse) {
                handleCache(message, validatedResponse);
                metrics.successes++;
                return validatedResponse;
            }
        }
    } catch {
        metrics.failures++;
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}

/**
 * Health check
 */
async function healthCheck() {
    console.log('Performing health check...');
    await Promise.allSettled(
        apiUrls.map((url) => fetchWithRetries(`${url}/ping`, {}, 3000, 1).catch(() => null))
    );
}

/**
 * Periodic tasks
 */
setInterval(reorderApiUrls, 2 * 60 * 1000);
setInterval(() => console.log('API Metrics:', metrics), 5 * 60 * 1000);

reorderApiUrls();
healthCheck();
