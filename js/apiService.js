// apiService.js

const apiUrls = [
    'http://22.ip.gl.ply.gg:18880',
    'https://wrldradd.loca.lt',
];

const TIMEOUTS = [5000, 10000, 20000];
const serverTimings = new Map();
const metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch data with retries, timeout, and exponential backoff.
 */
async function fetchWithRetries(url, options = {}, { timeout = 3000, retries = 3, backoff = 1000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json(); // Parse the response data
                return data;  // Return parsed data
            } else {
                console.error(`Request failed with status: ${response.status} at ${url}`);
                throw new Error(`Request failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error on attempt ${attempt} to fetch ${url}: ${error.message}`);
            if (attempt === retries) {
                console.error(`Failed after ${retries} attempts: ${url}`);
                throw new Error(`Failed after ${retries} attempts: ${url}`);
            }
        } finally {
            clearTimeout(timeoutId);
        }

        await delay(backoff * attempt);
    }
}

/**
 * Cache handler (stub for cache functionality).
 */
function handleCache(message, response = null) {
    // Implement caching logic here if needed
    return null; // Stub: no cache implemented
}

/**
 * Send message to multiple servers with fallback and caching.
 */
export async function sendMessageToServers(message) {
    const cachedResponse = handleCache(message);
    if (cachedResponse) return cachedResponse;

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Standard JSON Content-Type
        body: JSON.stringify({ message }),
    };

    metrics.totalRequests++;

    try {
        const responses = apiUrls.map((url, index) =>
            fetchWithRetries(`${url}/api/message`, options, { timeout: TIMEOUTS[index] || 45000 })
        );

        // Wait for the first successful response
        const response = await Promise.any(responses);

        // Log the response data (now that we can handle the full response)
        console.log('Server Response:', response);

        metrics.successes++;
        return response;  // Returning the actual response data from the server
    } catch (error) {
        console.error('Error sending message:', error.message);
        metrics.failures++;
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}
