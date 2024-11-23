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
 * Fetch with a timeout
 */
async function fetchWithTimeout(url, options, timeout) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);
}

/**
 * Retry mechanism with exponential backoff
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (attempt < retries) await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw new Error('All retry attempts failed');
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
                    await fetchWithTimeout(`${url}/ping`, {}, 3000); // Assume /ping endpoint exists
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
async function parseAndValidateResponse(response) {
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

    const fetchPromises = apiUrls.map((url, index) =>
        retryWithBackoff(() => fetchWithTimeout(`${url}/api/message`, options, TIMEOUTS[index] || 45000))
    );

    try {
        const response = await Promise.any(fetchPromises);
        if (response.ok) {
            const validatedResponse = await parseAndValidateResponse(response);
            if (validatedResponse) {
                cache.set(message, validatedResponse); // Cache the response
                return validatedResponse;
            }
        }
        console.warn('All servers responded, but none succeeded.');
    } catch (error) {
        console.error('Error with all APIs:', error.message);
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}

// Reorder APIs periodically (e.g., on startup or every 10 minutes)
setInterval(reorderApiUrls, 2 * 60 * 1000);
reorderApiUrls(); // Initial call
