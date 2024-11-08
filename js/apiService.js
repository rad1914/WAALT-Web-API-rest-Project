// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
];

// Función de solicitud con timeout y reintentos
async function fetchWithTimeoutAndRetry(url, options, timeout = 3000, retries = 4) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await Promise.race([
                fetch(url, options),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), timeout)
                ),
            ]);
        } catch (error) {
            if (i === retries) throw error;
            console.warn(`Reintentando (${i + 1})...`);
        }
    }
}

// Función principal para enviar el mensaje a los servidores en paralelo
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

    const requests = apiUrls.map(async (apiUrl) => {
        try {
            const response = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (response.ok) {
                const data = await response.json();
                return data.response || 'Sin respuesta del servidor';
            }
            console.warn(`No-OK Response from ${apiUrl}: ${response.status}`);
        } catch (error) {
            console.error(`Error con ${apiUrl}:`, error);
        }
        return null;
    });

    const responses = await Promise.allSettled(requests);
    const successfulResponse = responses.find(
        (result) => result.status === 'fulfilled' && result.value
    );

    return successfulResponse?.value || '✦ Recorcholis, tuve problemas para conectarme al servidor. Inténtalo de nuevo en un momento';
}
