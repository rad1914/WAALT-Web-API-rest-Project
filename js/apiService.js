// apiService.js

let apiUrls = [
    'https://wrldrad.loca.lt',
    'https://wrldrad24.loca.lt',
    'https://wrldrad1914.loca.lt',
 ];

const TIMEOUTS = [5000, 10000, 20000];
const CACHE_TTL = 5 * 60 * 1000; // Cache expiration in milliseconds
const serverTimings = new Map();
const cache = new Map();
const metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with retries and timeout
 */
async function fetchWithRetries(url, options = {}, timeout = 3000, retries = 3, backoff = 1000) {
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
function handleCache(key, value = null) {
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
async function reorderApiUrls() {
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

/**
 * Parse and validate response
 */
async function parseResponse(response) {
    try {
        const data = await response.json();
        return data?.response || null;
    } catch (error) {
        console.error('Error parsing response:', error.message);
        return null;
    }
}

/**
 * Send message with caching and fallback
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
            fetchWithRetries(`${url}/api/message`, options, TIMEOUTS[index] || 45000)
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
 * Perform health check
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
setInter
val(reorderApiUrls, 2 * 60 * 1000);
setInterval(() => console.log('API Metrics:', metrics), 5 * 60 * 1000);

reorderApiUrls();
healthCheck();