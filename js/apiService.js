// *apiService.js

import { apiUrls, timeoutDuration } from './config';

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
            const result = await parseJsonResponse(response);

            if (result.status === 'success') {
                log('info', `Handshake successful with API: ${apiUrl}`);
                return true;
            } else {
                log('warn', `Handshake failed with API: ${apiUrl}`);
            }
        } catch (error) {
            log('error', `Error during handshake with API: ${apiUrl}`, { error: error.message });
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
    log('warn', '✦ No API available after handshake attempts.');
}

/**
 * Send a message to the server, using fallback APIs if necessary.
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

    // Try the primary API first
    try {
        const primaryResponse = await fetchWithTimeout(apiUrls[0] + '/api/message', options, timeoutDuration);
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            log('info', 'Primary API Response Data:', data);
            return data?.response || 'No response from server';
        }
        log('warn', `Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        log('error', 'Primary API error:', { error: error.message });
    }

    // Try backup APIs in parallel if primary API failed
    const { success, response } = await attemptBackupApisInParallel(options);

    // If any backup API responded successfully, return its response
    if (success) return response;

    // If all APIs fail, return a generic error message
    return '✦ Damn, tuve problemas para conectarme al servidor. ¡Inténtalo de nuevo! D:';
}

/**
 * Attempt all backup APIs in parallel.
 */
async function attemptBackupApisInParallel(options) {
    const promises = apiUrls.slice(1).map(async (apiUrl) => {
        try {
            const response = await fetchWithTimeout(apiUrl + '/api/message', options, timeoutDuration);
            if (response.ok) {
                const data = await parseJsonResponse(response);
                log('info', `Backup API Success: ${apiUrl}`, data);
                return { success: true, response: data?.response };
            }
            log('warn', `Non-OK Response from ${apiUrl}: ${response.status}`);
        } catch (error) {
            log('error', `Error with backup API: ${apiUrl}`, { error: error.message });
        }
        return { success: false };
    });

    const results = await Promise.allSettled(promises);
    const successfulResult = results.find((result) => result.status === 'fulfilled' && result.value.success);

    return successfulResult?.value || { success: false, response: '' };
}

/**
 * Fetch with a timeout.
 */
async function fetchWithTimeout(url, options, timeout = timeoutDuration) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);
}

/**
 * Helper function to safely parse JSON response.
 * @param {Response} response - The fetch response object
 * @returns {Promise<object>} - Parsed JSON or empty object
 */
async function parseJsonResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        log('error', 'Failed to parse JSON response:', { error: error.message });
        return {}; // Return empty object on parse failure
    }
}

/**
 * Centralized logger function.
 */
function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] ${message}`, data);
}
