// *apiService.js

import { logger } from './logger'; // Centralized logging utility

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
];

// Dynamic API management (if needed, load from env or config file)
// Example: const apiUrls = process.env.API_URLS.split(',');

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

    // Helper function to handle handshake requests with retries
    async function tryHandshake(apiUrl) {
        const attemptHandshake = async () => {
            const response = await fetchWithTimeout(apiUrl + '/api/handshake', options);
            const result = await response.json();
            if (validateApiResponse(result)) {
                logger.info(`Handshake successful with API: ${apiUrl}`);
                return true;
            } else {
                logger.warn(`Handshake failed with API: ${apiUrl}`);
            }
        };

        try {
            return await retryWithBackoff(attemptHandshake);
        } catch (error) {
            logger.error(`Error during handshake with API: ${apiUrl}`, error.message);
            return false;
        }
    }

    // Attempt handshake with the main API first
    if (await tryHandshake(apiUrls[0])) return;

    // Attempt handshake with backup APIs if the main API fails
    for (const apiUrl of apiUrls.slice(1)) {
        if (await tryHandshake(apiUrl)) return;
    }

    // If no handshake succeeded, log a warning
    logger.warn('✦ No API available after handshake attempts.');
}

/**
 * Send a message to servers with fallback and concurrency.
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
        const primaryResponse = await fetchWithTimeout(apiUrls[0] + '/api/message', options);
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            logger.info('Primary API Response Data:', data);
            return data?.response || 'No response from server';
        }
        logger.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        logger.error('Primary API error:', error.message);
    }

    // Try backup APIs concurrently if primary API failed
    const { success, response } = await attemptBackupApisConcurrently(options);

    if (success) return response;

    // If all APIs fail, return a generic error message
    return '✦ Damn, tuve problemas para conectarme al servidor. ¡Inténtalo de nuevo! D:';
}

/**
 * Attempt fallback APIs concurrently for better response time.
 */
async function attemptBackupApisConcurrently(options) {
    const promises = apiUrls.slice(1).map(apiUrl =>
        fetchWithTimeout(apiUrl + '/api/message', options)
            .then(async response => ({
                apiUrl,
                response: response.ok ? await parseJsonResponse(response) : null,
            }))
            .catch(error => ({ apiUrl, error }))
    );

    const results = await Promise.all(promises);

    for (const { apiUrl, response, error } of results) {
        if (response) {
            logger.info(`Backup API Success: ${apiUrl}`, response);
            return { success: true, response: response.response || 'No response field in server response' };
        }
        if (error) {
            logger.error(`Backup API Error with ${apiUrl}:`, error.message);
        } else {
            logger.warn(`Non-OK Response from ${apiUrl}`);
        }
    }

    return { success: false, response: '' };
}

/**
 * Fetch with a timeout.
 */
async function fetchWithTimeout(url, options, timeout = 45000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);
}

/**
 * Retry logic with exponential backoff.
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            logger.error(`Retry attempt ${attempt} failed:`, error.message);
            if (attempt < retries) await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw new Error('All retry attempts failed');
}

/**
 * Validate API response schema.
 */
function validateApiResponse(data) {
    if (data && typeof data.response === 'string') return true;
    logger.warn('Invalid API response schema:', data);
    return false;
}

/**
 * Safely parse JSON response.
 */
async function parseJsonResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        logger.error('Failed to parse JSON response:', error.message);
        return {}; // Return empty object on parse failure
    }
}

/**
 * Centralized logger (example implementation).
 */
export const logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
};
