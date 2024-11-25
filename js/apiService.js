// apiService.js

let apiUrls = [
    'http://22.ip.gl.ply.gg:18880',
    'http://22.ip.gl.ply.gg:36560',
    
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
];

const metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetries(url, options = {}, timeout = 5000, retries = 3, backoff = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            console.info(`Attempting fetch (Attempt ${attempt}/${retries}) to ${url}`);
            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                console.info(`Success for ${url} on attempt ${attempt}`);
                return response;
            } else {
                console.warn(`Non-200 response from ${url}: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Request to ${url} timed out on attempt ${attempt}`);
            } else {
                console.error(`Error during fetch to ${url} (Attempt ${attempt}):`, error.message);
            }

            if (attempt < retries) {
                console.info(`Retrying ${url} after ${backoff * attempt}ms`);
                await delay(backoff * attempt);
            }
        }
    }

    throw new Error(`Failed to fetch from ${url} after ${retries} retries`);
}

async function parseResponse(response) {
    try {
        const data = await response.json();
        return data?.response || null;
    } catch (error) {
        console.error('Error parsing response:', error.message);
        return null;
    }
}

export async function sendMessageToServers(message) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    };

    metrics.totalRequests++;
    try {
        // Send requests in parallel with consistent timeout and retries
        const responses = apiUrls.map((url) =>
            fetchWithRetries(`${url}/api/message`, options, 5000)
        );

        // Return the first successful response
        const response = await Promise.any(responses);

        if (response.ok) {
            const validatedResponse = await parseResponse(response);
            if (validatedResponse) {
                metrics.successes++;
                return validatedResponse;
            }
        }
    } catch (error) {
        if (error.name === 'AggregateError') {
            console.error('All server requests failed:', error.errors.map((e) => e.message).join('; '));
        } else {
            console.error('Promise.any failed:', error.message);
        }
        metrics.failures++;
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}
