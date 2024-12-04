// apiService.js

const apiUrls = ['http://22.ip.gl.ply.gg:18880', '23.ip.gl.ply.gg:65329'];

const TIMEOUTS = [15000, 20000, 30000];
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch data with retries, timeout, and exponential backoff with jitter.
 */
async function fetchWithRetries(url, options = {}, { timeout = 15000, retries = 3, backoff = 2000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${retries} to ${url}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log(`Successful response from ${url}:`, data);
                return data;
            } else {
                console.error(`Server error ${url}: ${response.status}`);
                throw new Error(`Status: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Timeout at ${url} after ${timeout}ms`);
            } else {
                console.error(`Error on attempt ${attempt} for ${url}: ${error.message}`);
            }
            if (attempt < retries) {
                const jitter = Math.random() * 1000; // Adding jitter to avoid synchronized retries
                await delay(backoff * attempt + jitter);
            }
        }
    }
    throw new Error(`Failed after ${retries} attempts: ${url}`);
}

/**
 * Send message to multiple servers with fallback.
 */
export async function sendMessageToServers(message, jid) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, jid }),
    };

    // Rotate servers for load balancing
    const shuffledApiUrls = apiUrls.sort(() => Math.random() - 0.5);

    const requests = shuffledApiUrls.map((url, index) =>
        fetchWithRetries(`${url}/api/message`, options, { timeout: TIMEOUTS[index] || 30000 })
    );

    try {
        const results = await Promise.allSettled(requests);
        const successfulResponse = results.find(result => result.status === 'fulfilled');

        if (successfulResponse) {
            const response = successfulResponse.value.response || '✦ No content response.';
            console.log('Successful response:', response);
            return response;
        } else {
            console.error('No server responded successfully.');
            return '✦ No server could process the request.';
        }
    } catch (error) {
        console.error('Critical error during send:', error.message);
        return '✦ Unexpected error. Please try again.';
    }
}
