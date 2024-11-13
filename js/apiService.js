// *apiService.js

const apiUrls = [
    'https://wrldrad1914.loca.lt',
    'https://wrldradd.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
];

/**
 * Helper function to fetch with timeout and retries.
 * @param {string} url - The API URL to fetch.
 * @param {object} options - Fetch options.
 * @param {number} timeout - Timeout in milliseconds (default 30000 ms).
 * @param {number} retries - Number of retries (default 3).
 * @returns {Promise<Response>} - Fetch response.
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

    let primarySuccess = false;
    let serverResponse = '';

    try {
        // Intento con la API primaria con opción de reintento
        const primaryResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (primaryResponse.ok) {
            const data = await primaryResponse.json();
            primarySuccess = true;
            return data.response || 'No response from server';
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Error with primary API:', error);
    }

    // Iniciar los intentos en segundo plano con las APIs de respaldo
    const backgroundResult = await backgroundAttemptOtherApis(message, options);

    // Si una de las APIs de respaldo tuvo éxito, retornar esa respuesta
    if (primarySuccess) {
        return serverResponse;
    } else if (backgroundResult.success) {
        return backgroundResult.response;
    }

    // Si ninguna API respondió correctamente, devolver mensaje de error
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}


/**
 * Helper function to attempt the remaining APIs in the background.
 * @param {string} message - The message to send.
 * @param {object} options - Fetch options.
 * @returns {Promise<object>} - Resolves with success status and server response if any API succeeds.
 */
async function backgroundAttemptOtherApis(message, options) {
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const response = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (response.ok) {
                const data = await response.json();
                console.log(`Background API Success: ${apiUrl}`, data.response);
                // Retornar éxito y respuesta del servidor
                return { success: true, response: data.response };
            } else {
                console.warn(`No-OK Response from ${apiUrl}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error with ${apiUrl} in background:`, error);
        }
    }
    // Si todas fallan, retornar sin éxito
    return { success: false, response: '' };
}
