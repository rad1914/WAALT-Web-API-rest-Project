// *apiService.js

const apiUrls = [
    'https://wrldrad1914.loca.lt',
    'https://wrldradd.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
];

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

    try {
        // Intento con la API primaria con opción de reintento
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

    // Inicia los intentos en segundo plano con las APIs de respaldo y espera la respuesta
    const { success, response } = await backgroundAttemptOtherApis(message, options);

    // Si alguna API en segundo plano respondió correctamente, devolver esa respuesta
    if (success) {
        return response;
    }

    // Si ninguna API respondió correctamente, devolver mensaje de error
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}




async function backgroundAttemptOtherApis(message, options) {
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const response = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (response.ok) {
                const data = await parseJsonResponse(response);
                console.log(`Background API Success: ${apiUrl}`, data);
                // Retornar éxito y respuesta del servidor
                return { success: true, response: data?.response || 'No response field in server response' };
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


/**
 * Helper function to safely parse JSON response
 * @param {Response} response - The fetch response object
 * @returns {Promise<object>} - Parsed JSON or empty object
 */
async function parseJsonResponse(response) {
    try {
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return {}; // Retornar objeto vacío en caso de fallo
    }
}

