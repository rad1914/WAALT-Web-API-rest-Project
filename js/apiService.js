// *apiService.js

// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
];

async function fetchWithTimeout(url, options, timeout = 30000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);
}

/**
 * Function to perform a handshake with the server to ensure connectivity
 * @param {string} apiUrl - The base URL of the API server
 * @returns {Promise<boolean>} - True if handshake is successful, false otherwise
 */
async function performHandshake(apiUrl) {
    const options = {
        method: 'GET',
        credentials: 'include', // Include cookies in the request if needed
        headers: { 'bypass-tunnel-reminder': 'true' },
    };

    try {
        const response = await fetchWithTimeout(`${apiUrl}/api/handshake`, options, 10000); // 10 seconds timeout
        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                console.log(`Handshake successful with ${apiUrl}: ${result.message}`);
                return true;
            } else {
                console.warn(`Handshake failed with ${apiUrl}: ${result.message}`);
            }
        } else {
            console.warn(`Non-OK response from handshake at ${apiUrl}: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error during handshake with ${apiUrl}:`, error.message);
    }
    return false;
}

/**
 * Function to send a message to the primary API server with fallback to backup servers
 * @param {string} message - The message to send
 * @returns {Promise<string>} - The server response or an error message
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

    // Perform handshake with primary API first
    console.log(`Initiating handshake with primary API: ${apiUrls[0]}`);
    const primaryHandshakeSuccess = await performHandshake(apiUrls[0]);
    if (primaryHandshakeSuccess) {
        // Try sending message to primary API if handshake was successful
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
    } else {
        console.warn(`Primary API handshake failed. Attempting backup APIs...`);
    }

    // Try backup APIs in sequence if primary API handshake or message request failed
    const { success, response } = await attemptBackupApisSequentially(options);

    // If any backup API responded successfully, return its response
    if (success) return response;

    // If all APIs fail, return a generic error message
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}

/**
 * Function to attempt sending a message using backup API servers sequentially
 * @param {object} options - Fetch options for sending the message
 * @returns {Promise<{success: boolean, response: string}>} - Success status and response message
 */
async function attemptBackupApisSequentially(options) {
    for (const apiUrl of apiUrls.slice(1)) {
        console.log(`Initiating handshake with backup API: ${apiUrl}`);
        const handshakeSuccess = await performHandshake(apiUrl);

        if (!handshakeSuccess) {
            console.warn(`Handshake failed with ${apiUrl}. Skipping this API.`);
            continue; // Skip this API if handshake fails
        }

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
