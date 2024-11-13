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

/**
 * Main function to send the message to servers with failover support.
 * @param {string} message - The formatted message to send.
 * @returns {Promise<string>} - The server response message.
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

    let apiSuccessResponse = '';

    try {
        // Attempt to send the message to the primary API with retries
        const primaryResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (primaryResponse.ok) {
            const data = await primaryResponse.json();
            apiSuccessResponse = data.response;
            console.log(`API Success: ${apiUrls[0]} ✦ ${apiSuccessResponse}`);
            return 'Operación completada exitosamente en una API.';
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Error with primary API:', error);
    }

    // Initiate background attempts with fallback APIs
    const backgroundResults = await backgroundAttemptOtherApis(message, options);

    // Check if any background API was successful
    const successfulResponse = backgroundResults.find(result => result.status === 'fulfilled' && result.value);
    if (successfulResponse) {
        console.log(`API Success: ${successfulResponse.url} ✦ ${successfulResponse.message}`);
        return 'Operación completada exitosamente en una API.';
    }

    // Return error message if no API succeeded
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
                return { status: 'fulfilled', value: true, url: apiUrl, message: data.response };
            }
            console.warn(`No-OK Response from ${apiUrl}: ${response.status}`);
            return { status: 'rejected', value: false };
        } catch (error) {
            console.error(`Error with ${apiUrl} in background:`, error);
            return { status: 'rejected', value: false };
        }
    });

    // Wait for all background requests to finish
    const results = await Promise.allSettled(requests);
    return results;
}
