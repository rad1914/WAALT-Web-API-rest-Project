const apiUrls = [
    'https://wrldradd.loca.lt',
    // Add other server URLs as needed
];

export async function fetchWithTimeout(url, options, timeout = 5000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
    ]);
}

export async function sendMessageToServers(message) {
    for (const apiUrl of apiUrls) {
        try {
            const response = await fetchWithTimeout(`${apiUrl}/api/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'bypass-tunnel-reminder': 'true'
                },
                body: JSON.stringify({ message }),
                mode: 'cors',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.response) {
                    return data.response; // Return the first successful response
                }
            } else {
                console.warn(`Non-OK response from ${apiUrl}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error with ${apiUrl}:`, error);
        }
    }
    // Return null if no server provided a successful response
    return 'Lo siento, no pude generar una respuesta en este momento. Inténtalo más tarde.';
}
