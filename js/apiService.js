// src/api/apiService.js (frontend):
import { fetchUserIP, convertIPToJID } from './utilities.js';

const apiUrl = 'http://22.ip.gl.ply.gg:18880';
const TIMEOUT = 15000;

async function fetchWithRetries(url, options = {}, { timeout = TIMEOUT, retries = 3, backoff = 2000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) return response.json();

            throw new Error(`Error: ${response.status}`);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Timeout at ${url} after ${timeout}ms`);
            } else {
                console.error(`Error on attempt ${attempt} for ${url}: ${error.message}`);
            }

            if (attempt === retries) throw new Error(`Failed after ${retries} attempts: ${url}`);

            const jitter = Math.random() * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoff * attempt + jitter));
        }
    }
}

async function sendMessageToServers(message) {
    if (!message || typeof message !== 'string') {
        return '✦ Invalid message format.';
    }

    try {
        const userIP = await fetchUserIP();
        if (!userIP) throw new Error('Failed to fetch user IP');
        const jid = convertIPToJID(userIP);

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, jid }),
        };

        const responseData = await fetchWithRetries(`${apiUrl}/api/message`, options);

        if (responseData?.data?.length) {
            return responseData.data[0].response || '✦ No response content.';
        }

    } catch (error) {
        console.error('Error sending message:', error);
        return '✦ Error sending message.';
    }
}

export { sendMessageToServers };
