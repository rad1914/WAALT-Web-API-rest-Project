// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
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

    // Helper function to handle handshake requests with a timeout
    async function tryHandshake(apiUrl) {
        try {
            const response = await fetchWithTimeout(apiUrl + '/api/handshake', options);
            const result = await response.json();

            if (result.status === 'success') {
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

    // If no handshake succeeded, log a warning
    console.warn('✦ No API available after handshake attempts.');
}

/**
 * Fetch with a timeout
 */
async function fetchWithTimeout(url, options, timeout = 30000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);
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

    // Try the primary API first with one retry
    try {
        const primaryResponse = await fetchWithTimeout(apiUrls[0] + '/api/message', options);
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            console.log('Primary API Response Data:', data);
            return data?.response || 'No response from server';
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Primary API error:', error);
    }

    // Try backup APIs in sequence if primary API failed
    const { success, response } = await attemptBackupApisSequentially(options);

    // If any backup API responded successfully, return its response
    if (success) return response;

    // If all APIs fail, return a generic error message
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}

async function attemptBackupApisSequentially(options) {
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const response = await fetchWithTimeout(apiUrl + '/api/message', options);
            if (response.ok) {
                const data = await parseJsonResponse(response);
                console.log(`Backup API Success: ${apiUrl}`, data);
                return { success: true, response: data?.response || 'No response field in server response' };
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
 * @param {Response} response - The fetch response object
 * @returns {Promise<object>} - Parsed JSON or empty object
 */
async function parseJsonResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        console.error('Failed to parse JSON response:', error.message);
        return {}; // Return empty object on parse failure
    }
}
