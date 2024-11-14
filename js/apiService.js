// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
];

/**
 * Function to handle fetch with timeout and retry logic.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - The fetch options.
 * @param {number} timeout - Timeout in milliseconds.
 * @param {number} retries - Number of retry attempts.
 * @returns {Promise<Response>} - The fetch response object.
 */
async function fetchWithTimeoutAndRetry(url, options, timeout = 30000, retries = 3) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await Promise.race([
                fetch(url, options),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
            ]);
        } catch (error) {
            if (i === retries) throw error;
            console.warn(`Retrying (${i + 1})...`);
        }
    }
}

/**
 * Sends a handshake ping to check server availability before sending user messages.
 * @returns {boolean} - Returns true if handshake is successful, false otherwise.
 */
export async function handshakeWithServer() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ message: '.ai ping' }),
        mode: 'cors',
        credentials: 'include',
    };

    console.log('Performing handshake with primary server...');
    try {
        const primaryResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            console.log('Handshake successful with primary server:', data);
            return true;
        }
        console.warn(`Primary handshake failed with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Primary handshake error:', error);
    }

    // Attempt handshake with backup servers
    console.log('Attempting handshake with backup servers...');
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const backupResponse = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (backupResponse.ok) {
                const data = await parseJsonResponse(backupResponse);
                console.log(`Handshake successful with backup server (${apiUrl}):`, data);
                return true;
            } else {
                console.warn(`Backup handshake failed with status: ${backupResponse.status}`);
            }
        } catch (error) {
            console.error(`Backup handshake error with ${apiUrl}:`, error);
        }
    }

    console.warn('All handshake attempts failed. Server may be temporarily full.');
    return false;
}

/**
 * Sends a user message to the server with fallback handling.
 * @param {string} message - The user's message.
 * @returns {Promise<string>} - The server's response message.
 */
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

    try {
        const primaryResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            console.log('Primary API Response Data:', data);
            return data?.response || 'No response from server';
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Error with primary API:', error);
    }

    const { success, response } = await backgroundAttemptOtherApis(message, options);
    if (success) return response;
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}

/**
 * Attempts to send a message to backup APIs in case of primary failure.
 * @param {string} message - The user's message.
 * @param {object} options - The fetch options.
 * @returns {Promise<object>} - The success status and response message.
 */
async function backgroundAttemptOtherApis(message, options) {
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const response = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (response.ok) {
                const data = await parseJsonResponse(response);
                console.log(`Background API Success: ${apiUrl}`, data);
                return { success: true, response: data?.response || 'No response field in server response' };
            }
        } catch (error) {
            console.error(`Error with ${apiUrl} in background:`, error);
        }
    }
    return { success: false, response: '' };
}

/**
 * Helper function to safely parse JSON response.
 * @param {Response} response - The fetch response object.
 * @returns {Promise<object>} - Parsed JSON or empty object.
 */
async function parseJsonResponse(response) {
    try {
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return {};
    }
}
