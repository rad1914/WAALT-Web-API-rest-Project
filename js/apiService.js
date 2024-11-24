// apiService.js

import {
    apiUrls,
    TIMEOUTS,
    metrics,
    serverTimings,
    fetchWithRetries,
    handleCache,
    parseResponse,
    delay,
} from './apiUtils.js';

let apiUrlList = [...apiUrls]; // Local copy to maintain order

/**
 * Reorder API URLs by response times
 */
async function reorderApiUrls() {
    const results = await Promise.allSettled(
        apiUrlList.map(async (url) => {
            const startTime = Date.now();
            try {
                await fetchWithRetries(`${url}/ping`, {}, 3000, 1);
                const responseTime = Date.now() - startTime;
                serverTimings.set(url, responseTime);
                return { url, time: responseTime };
            } catch {
                return { url, time: Infinity };
            }
        })
    );

    apiUrlList = results
        .filter((result) => result.status === 'fulfilled' && result.value.time !== Infinity)
        .sort((a, b) => a.value.time - b.value.time)
        .map((result) => result.value.url);

    console.log('Reordered API URLs:', apiUrlList);
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
        const responses = apiUrlList.map((url, index) =>
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
async function healthCheck() {
    console.log('Performing health check...');
    await Promise.allSettled(
        apiUrlList.map((url) => fetchWithRetries(`${url}/ping`, {}, 3000, 1).catch(() => null))
    );
}

/**
 * Periodic tasks
 */
setInterval(reorderApiUrls, 2 * 60 * 1000);
setInterval(() => console.log('API Metrics:', metrics), 5 * 60 * 1000);

reorderApiUrls();
healthCheck();
