// apiService.js

let apiUrls = [
    'https://wrldrad.loca.lt',
    'https://wrldrad24.loca.lt',
    'https://wrldrad1914.loca.lt',
    'http://22.ip.gl.ply.gg:18880',
    'http://23.ip.gl.ply.gg:65329',
];

const TIMEOUTS = [5000, 10000, 20000]; // Sequential timeouts for faster fallback
const cache = new Map(); // In-memory cache

/**
 * Helper to add a delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout and retries using exponential backoff
 */
async function fetchWithRetries(url, options, timeout, retries = 3, backoff = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await Promise.race([
                fetch(url, options),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
            ]);
        } catch (error) {
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
        const timings = await Promise.all(
            apiUrls.map(async (url) => {
                const startTime = Date.now();
                try {
                    await fetchWithRetries(`${url}/ping`, {}, 3000, 1); // Single attempt for /ping
                    return { url, time: Date.now() - startTime };
                } catch {
                    return { url, time: Infinity };
                }
            })
        );

        apiUrls = timings.sort((a, b) => a.time - b.time).map(({ url }) => url);
        console.log('Reordered API URLs:', apiUrls);
    } catch (error) {
        console.error('Error reordering API URLs:', error.message);
    }
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
    if (cache.has(message)) {
        console.log('Returning cached response for message:', message);
        return cache.get(message);
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
        // Try all URLs in parallel with timeouts
        const responses = apiUrls.map((url, index) =>
            fetchWithRetries(`${url}/api/message`, options, TIMEOUTS[index] || 45000)
        );
        const response = await Promise.any(responses);

        if (response.ok) {
            const validatedResponse = await parseResponse(response);
            if (validatedResponse) {
                cache.set(message, validatedResponse); // Cache successful response
                return validatedResponse;
            }
        }
        console.warn('All servers responded, but none succeeded.');
    } catch (error) {
        console.error('Error with all APIs:', error.message);
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}

// Periodic API URL reordering
setInterval(reorderApiUrls, 2 * 60 * 1000);
reorderApiUrls(); // Initial call
