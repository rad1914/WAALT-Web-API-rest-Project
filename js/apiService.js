// *apiService.js

const apiUrls = [

    'http://22.ip.gl.ply.gg:18880',
    'http://23.ip.gl.ply.gg:65329',
    'https://proxy-6zdljnzl6-ramses-aracen-s-projects.vercel.app',
];

/**
 * Fetch con un timeout
 */
async function fetchWithTimeout(url, options, timeout = 45000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);
}

/**
 * Mecanismo de reintento con backoff exponencial
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            console.error(`Intento ${attempt} fallido:`, error.message);
            if (attempt < retries) await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw new Error('Todos los intentos de reintento fallaron');
}

export async function sendMessageToServers(message) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ message }),
        mode: 'cors', // Habilitar CORS
        credentials: 'include', // Enviar cookies o credenciales
    };

    // Intentar con la API principal
    try {
        const primaryResponse = await retryWithBackoff(() => fetchWithTimeout(apiUrls[0] + '/api/message', options));
        if (primaryResponse.ok) {
            const data = await parseJsonResponse(primaryResponse);
            if (validateApiResponse(data)) {
                console.log('Respuesta de la API principal:', data);
                return data.response;
            }
        }
        console.warn(`La API principal respondió con estado: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Error en la API principal:', error.message);
    }

    // Intentar con APIs de respaldo si falla la principal
    const { success, response } = await attemptBackupApisSequentially(options);

    if (success) return response;

    return '✦ No se pudo conectar al servidor. ¡Inténtalo de nuevo!';
}

async function attemptBackupApisSequentially(options) {
    for (const apiUrl of apiUrls.slice(1)) {
        try {
            const response = await fetchWithTimeout(apiUrl + '/api/message', options);
            if (response.ok) {
                const data = await parseJsonResponse(response);
                if (validateApiResponse(data)) {
                    console.log(`API de respaldo exitosa: ${apiUrl}`, data);
                    return { success: true, response: data.response };
                }
            } else {
                console.warn(`Respuesta no OK desde ${apiUrl}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error con la API de respaldo ${apiUrl}:`, error.message);
        }
    }
    return { success: false, response: '' };
}

/**
 * Ayudante para analizar respuestas JSON
 */
async function parseJsonResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        console.error('Error al analizar JSON:', error.message);
        return {};
    }
}

/**
 * Validar esquema de respuesta de la API
 */
function validateApiResponse(data) {
    if (data && typeof data.response === 'string') return true;
    console.warn('Esquema de respuesta de la API inválido:', data);
    return false;
}
