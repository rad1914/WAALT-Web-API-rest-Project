// apiService.js

const apiUrls = ['http://22.ip.gl.ply.gg:18880'];

const TIMEOUTS = [15000, 20000, 30000];
const metrics = { totalRequests: 0, successes: 0, failures: 0 };

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch data with retries, timeout, and exponential backoff.
 */
async function fetchWithRetries(url, options = {}, { timeout = 15000, retries = 3, backoff = 2000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Intento ${attempt}/${retries} a ${url}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log(`Respuesta exitosa de ${url}:`, data);
                return data;
            } else {
                console.error(`Error del servidor ${url}: ${response.status}`);
                throw new Error(`Status: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Timeout en ${url} después de ${timeout}ms`);
            } else {
                console.error(`Error en intento ${attempt} para ${url}: ${error.message}`);
            }
            if (attempt < retries) await delay(backoff * attempt);
        }
    }
    throw new Error(`Falló después de ${retries} intentos: ${url}`);
}

/**
 * Cache handler (stub for cache functionality).
 */
function handleCache(message, jid, response = null) {
    return null; // Pendiente de implementación de caché
}

/**
 * Send message to multiple servers with fallback and caching.
 */
export async function sendMessageToServers(message, jid) {
    const cachedResponse = handleCache(message, jid);
    if (cachedResponse) return cachedResponse;

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, jid }),
    };

    metrics.totalRequests++;

    const requests = apiUrls.map((url, index) =>
        fetchWithRetries(`${url}/api/message`, options, { timeout: TIMEOUTS[index] || 30000 })
    );

    try {
        const results = await Promise.allSettled(requests);
        const successfulResponse = results.find(result => result.status === 'fulfilled');

        if (successfulResponse) {
            console.log('Respuesta exitosa:', successfulResponse.value);
            metrics.successes++;
            return successfulResponse.value.response || '✦ Respuesta sin contenido.';
        } else {
            metrics.failures++;
            console.error('Ningún servidor respondió exitosamente.');
            return '✦ Ningún servidor pudo procesar la solicitud.';
        }
    } catch (error) {
        console.error('Error crítico en el envío:', error.message);
        metrics.failures++;
        return '✦ Error inesperado. Inténtalo de nuevo.';
    }
}
