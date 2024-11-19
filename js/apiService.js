// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
];

/**
 * Perform a handshake with the main API or fallback APIs.
 * Logs a warning if no API is available after attempts.
 */
export async function performHandshakeWithFallback() {
    const options = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'bypass-tunnel-reminder': 'true',
        },
    };

    async function tryHandshake(apiUrl) {
        try {
            const response = await fetchWithTimeout(apiUrl + '/api/handshake', options);
            const result = await parseJsonResponse(response);

            if (validateApiResponse(result)) {
                console.log(`Handshake successful with API: ${apiUrl}`);
                return true;
            } else {
                console.warn(`Handshake failed with API: ${apiUrl}`);
            }
        } catch (error) {
            console.error(`Error during handshake with API: ${apiUrl}`, error.message);
        }
        return false;
    }

    // Attempt handshake with the main API first
    if (await tryHandshake(apiUrls[0])) return;

    // Attempt handshake with backup APIs if the main API fails
    for (const apiUrl of apiUrls.slice(1)) {
        if (await tryHandshake(apiUrl)) return;
    }

    console.warn('✦ No API available after handshake attempts.');
}

/**
 * Fetch with a timeout
 */
async function fetchWithTimeout(url, options, timeout = 45000) {
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

export async function sendMessageToServers(message) {
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

    // Try the primary API first with retry mechanism
    try {
        const primaryResponse = await retryWithBackoff(() => fetchWithTimeout(apiUrls[0] + '/api/message', options));
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            if (validateApiResponse(data)) {
                console.log('Primary API Response Data:', data);
                return data.response;
            }
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Primary API error:', error.message);
    }

    // Try backup APIs in sequence if primary API failed
    const { success, response } = await attemptBackupApisSequentially(options);

    if (success) return response;

    return '✦ Damn, tuve problemas para conectarme al servidor. ¡Inténtalo de nuevo! D:';
}

async function attemptBackupApisSequentially(options) {
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const response = await fetchWithTimeout(apiUrl + '/api/message', options);
            if (response.ok) {
                const data = await parseJsonResponse(response);
                if (validateApiResponse(data)) {
                    console.log(`Backup API Success: ${apiUrl}`, data);
                    return { success: true, response: data.response };
                }
            } else {
                console.warn(`Non-OK Response from ${apiUrl}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Backup API Error with ${apiUrl}:`, error.message);
        }
    }
    return { success: false, response: '' };
}

/**
 * Helper function to safely parse JSON response
 */
async function parseJsonResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        console.error('Failed to parse JSON response:', error.message);
        return {}; // Return empty object on parse failure
    }
}

/**
 * Validate API response schema
 */
function validateApiResponse(data) {
    if (data && typeof data.response === 'string') return true;
    console.warn('Invalid API response schema:', data);
    return false;
}
