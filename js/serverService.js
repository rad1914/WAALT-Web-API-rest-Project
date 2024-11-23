// serverService.js

import { apiUrls, handleCache, fetchWithRetries, reorderApiUrls, serverTimings, metrics } from './apiService.js';

const TIMEOUTS = [5000, 10000, 20000];

/**
 * Parse and validate response
 */
async function parseResponse(response) {
    try {
        const data = await response.json();
        return data?.response || null;
    } catch (error) {
        console.error('Error parsing response:', error.message);
        return null;
    }
}

/**
 * Send message with caching and fallback
 */
export async function sendMessageToServers(message) {
    const cachedResponse = handleCache(message);
    if (cachedResponse) return cachedResponse;

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'bypass-tunnel-reminder': 'true' },
        body: JSON.stringify({ message }),
        mode: 'cors',
        credentials: 'include',
    };

    metrics.totalRequests++;
    try {
        const responses = apiUrls.map((url, index) =>
            fetchWithRetries(`${url}/api/message`, options, TIMEOUTS[index] || 45000)
        );
        const response = await Promise.any(responses);

        if (response.ok) {
            const validatedResponse = await parseResponse(response);
            if (validatedResponse) {
                handleCache(message, validatedResponse);
                metrics.successes++;
                return validatedResponse;
            }
        }
    } catch {
        metrics.failures++;
    }

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}

/**
 * Perform health check
 */
export async function healthCheck() {
    console.log('Performing health check...');
    await Promise.allSettled(
        apiUrls.map((url) => fetchWithRetries(`${url}/ping`, {}, 3000, 1).catch(() => null))
    );
}

/**
 * Periodic tasks
 */
setInterval(reorderApiUrls, 2 * 60 * 1000);
setInterval(() => console.log('API Metrics:', metrics), 5 * 60 * 1000);

reorderApiUrls();
healthCheck();
