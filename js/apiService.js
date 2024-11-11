// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
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

    try {
        // Attempt to send the message to the primary API with retries
        const primaryResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (primaryResponse.ok) {
            const data = await primaryResponse.json();
            return data.response || 'No response from server';
        }
        console.warn(`Primary API responded with status: ${primaryResponse.status}`);
    } catch (error) {
        console.error('Error with primary API:', error);
    }

    // If primary API fails, initiate background attempts with fallback APIs
    backgroundAttemptOtherApis(message, options);
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}

/**
 * Helper function to attempt the remaining APIs in the background.
 * @param {string} message - The message to send.
 * @param {object} options - Fetch options.
 */
function backgroundAttemptOtherApis(message, options) {
    const requests = apiUrls.slice(1).map(async (apiUrl) => {
        try {
            const response = await fetchWithTimeoutAndRetry(`${apiUrl}/api/message`, options);
            if (response.ok) {
                const data = await response.json();
                console.log(`Background API Success: ${apiUrl}`, data.response);
            } else {
                console.warn(`No-OK Response from ${apiUrl}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error with ${apiUrl} in background:`, error);
        }
    });

    // Process all background API requests silently
    Promise.allSettled(requests);
}
