// apiService.js

import { fetchUserIP, convertIPToJID } from './utilities.js';

const apiUrl = 'http://22.ip.gl.ply.gg:18880';
const TIMEOUT = 15000;

/**
 * Fetch data with retries, timeout, and exponential backoff with jitter.
 */
async function fetchWithRetries(url, options = {}, { timeout = TIMEOUT, retries = 3, backoff = 2000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${retries} to ${url}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log(`Successful response from ${url}:`, JSON.stringify(data, null, 2));
                return data;
            } else {
                console.error(`Server error ${url}: ${response.status}`);
                throw new Error(`Status: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Timeout at ${url} after ${timeout}ms`);
            } else {
                console.error(`Error on attempt ${attempt} for ${url}: ${error.message}`);
            }
            if (attempt < retries) {
                const jitter = Math.random() * 1000; // Adding jitter to avoid synchronized retries
                await new Promise((resolve) => setTimeout(resolve, backoff * attempt + jitter));
            }
        }
    }
    throw new Error(`Failed after ${retries} attempts: ${url}`);
}

/**
 * Send a message to the API server.
 */
export async function sendMessageToServers(message) {
    try {
        const userIP = await fetchUserIP(); // Fetch the user's IP
        if (!userIP) throw new Error('Failed to fetch user IP');
        const jid = convertIPToJID(userIP); // Convert IP to JID

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, jid }),
        };

        const responseData = await fetchWithRetries(`${apiUrl}/api/message`, options, { timeout: TIMEOUT });

        // Extract the message or provide a fallback
        const responseMessage = responseData?.response || responseData?.message || '✦ No content response.';
        return responseMessage;
    } catch (error) {
        console.error('Critical error during send:', error.message);
        return '✦ Unexpected error. Please try again.';
    }
}
