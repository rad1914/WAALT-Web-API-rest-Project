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
    
    try {
        // Intento con la API primaria con opción de reintento
        const primaryResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (primaryResponse.ok) {
            const data = await primaryResponse.json();
            primarySuccess = true; // Indica éxito para evitar mensaje de error
            return data.response || 'No response from server';
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Error with primary API:', error);
    }

    // Inicia los intentos en segundo plano con las APIs de respaldo
    const backgroundResults = await backgroundAttemptOtherApis(message, options);

    // Evalúa si alguna de las solicitudes en segundo plano fue exitosa
    const anySuccess = backgroundResults.some(result => result.status === 'fulfilled' && result.value);

    if (primarySuccess || anySuccess) {
        return 'Operación completada exitosamente en una de las APIs.';
    }

    // Si ninguna fue exitosa, entonces se envía el mensaje de error
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}


/**
 * Helper function to attempt the remaining APIs in the background.
 * @param {string} message - The message to send.
 * @param {object} options - Fetch options.
 * @returns {Promise<Array>} - Resolves with the results of background attempts.
 */
async function backgroundAttemptOtherApis(message, options) {
    const requests = apiUrls.slice(1).map(async (apiUrl) => {
        try {
            const response = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (response.ok) {
                const data = await response.json();
                console.log(`Background API Success: ${apiUrl}`, data.response);
                return { status: 'fulfilled', value: true }; // Indica éxito en la respuesta
            } else {
                console.warn(`No-OK Response from ${apiUrl}: ${response.status}`);
                return { status: 'rejected', value: false };
            }
        } catch (error) {
            console.error(`Error with ${apiUrl} in background:`, error);
            return { status: 'rejected', value: false };
        }
    });

    // Espera a que todas las solicitudes en segundo plano terminen
    const results = await Promise.allSettled(requests);
    return results;
}
