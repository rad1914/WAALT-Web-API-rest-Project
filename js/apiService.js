// apiService.js

export let apiUrls = [
    'https://wrldrad.loca.lt',
    'https://wrldrad24.loca.lt',
    'https://wrldrad1914.loca.lt',
    'http://22.ip.gl.ply.gg:18880',
    'http://23.ip.gl.ply.gg:65329',
];

const TIMEOUTS = [5000, 10000, 20000];
const CACHE_TTL = 5 * 60 * 1000; // Cache expiration in milliseconds
export const serverTimings = new Map();
export const cache = new Map();
export const metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * Reorder API URLs by response times
 */
export async function reorderApiUrls() {
    const results = await Promise.allSettled(
        apiUrls.map(async (url) => {
            const startTime = Date.now();
            try {
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
