// *apiService.js

const apiUrls = [
    'https://wrldradd.loca.lt',
    'https://wrldrad1914.loca.lt',
    'https://wrldradd24.loca.lt',
    'https://wrldradd2.loca.lt',
];

// Request function with timeout and retries
async function fetchWithTimeoutAndRetry(url, options, timeout = 30000, retries = 3) {
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
            console.warn(`Retrying (${i + 1})...`);
        }
    }
}

// Main function to send the message to servers
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
        // Attempt to send to the primary API with retries
        const mainResponse = await fetchWithTimeoutAndRetry(`${apiUrls[0]}/api/message`, options);
        if (mainResponse.ok) {
            const data = await mainResponse.json();
            return data.response || 'No response from server';
        }
        console.warn(`Primary API responded with No-OK: ${mainResponse.status}`);
    } catch (error) {
        console.error(`Error with primary API:`, error);
    }

    // If the main API fails, return an initial response and start silent background attempts
    backgroundAttemptOtherApis(message, options);
    return '✦ Oops, I had trouble connecting to the server. Please try again shortly.';
}

// Helper function to attempt the remaining APIs in the background
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
    Promise.allSettled(requests); // Process all background requests
}
