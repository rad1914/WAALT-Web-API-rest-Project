// apiService.js

const apiUrls = [
    'http://22.ip.gl.ply.gg:18880',
    'https://wrldrad1914.loca.lt',
    // Fallback APIs:
    'http://23.ip.gl.ply.gg:65329',
    'https://wrldradd.loca.lt',
];

const metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function filterUrlsByProtocol() {
    const isHttps = window.location.protocol === 'https:';
    console.info(`Page is using ${isHttps ? 'HTTPS' : 'HTTP'}. Filtering URLs accordingly.`);
    return apiUrls.filter((url) => url.startsWith(isHttps ? 'https://' : 'http://'));
}

async function fetchWithRetries(url, options = {}, timeout = 5000, retries = 3, backoff = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            console.info(`Attempt ${attempt}/${retries} - Fetching from ${url}`);
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                console.info(`Success from ${url} on attempt ${attempt}`);
                return response;
            } else {
                console.warn(`Received non-200 response from ${url}: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Request to ${url} timed out on attempt ${attempt}`);
            } else {
                console.error(`Error during fetch to ${url} on attempt ${attempt}: ${error.message}`);
            }

            if (attempt < retries) {
                const delayTime = backoff * attempt;
                console.info(`Retrying ${url} in ${delayTime}ms`);
                await delay(delayTime);
            }
        }
    }

    throw new Error(`All ${retries} fetch attempts failed for ${url}`);
}

async function parseResponse(response) {
    try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return data?.response || null;
        } else {
            console.warn('Response is not JSON. Skipping parsing.');
        }
    } catch (error) {
        console.error('Error parsing response:', error.message);
    }
    return null;
}

export async function sendMessageToServers(message) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    };

    const selectedUrls = filterUrlsByProtocol();
    if (!selectedUrls.length) {
        console.error('No valid API URLs available for the current protocol.');
        return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
    }

    metrics.totalRequests++;
    try {
        // Send requests in parallel with retries and timeouts
        const responses = selectedUrls.map((url) =>
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
            console.error(
                'All server requests failed:',
                error.errors.map((e) => e.message).join('; ')
            );
        } else {
            console.error('Error occurred during Promise.any:', error.message);
        }
        metrics.failures++;
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}
