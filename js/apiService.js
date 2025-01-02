
// src/api/apiService.js (frontend):
import { fetchUserIP, convertIPToJID } from './utilities.js';

const apiUrl = 'http://22.ip.gl.ply.gg:18880';
const TIMEOUT = 15000;

const STATUS_CODES = { CLIENT_ERROR: 400, SERVER_ERROR: 500 };

async function fetchWithRetries(url, options = {}, { timeout = TIMEOUT, retries = 3, backoff = 2000 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return data;
            } else if (response.status >= STATUS_CODES.CLIENT_ERROR && response.status < STATUS_CODES.SERVER_ERROR) {
                throw new Error(`Client error: ${response.status}`);
            } else if (response.status >= STATUS_CODES.SERVER_ERROR) {
                throw new Error(`Server error: ${response.status}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Timeout at ${url} after ${timeout}ms`);
            } else {
                console.error(`Error on attempt ${attempt} for ${url}: ${error.message}`);
            }
            if (attempt < retries) {
                const jitter = Math.random() * 1000;
                await new Promise((resolve) => setTimeout(resolve, backoff * attempt + jitter));
            }
        }
    }
    throw new Error(`Failed after ${retries} attempts: ${url}`);
}

export async function sendMessageToServers(message) {
    try {
        if (!message || typeof message !== 'string') {
            throw new Error('Invalid message format.');
        }

        const userIP = await fetchUserIP();
        if (!userIP) throw new Error('Failed to fetch user IP');
        const jid = convertIPToJID(userIP);

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                jid,
            }),
        };

        const responseData = await fetchWithRetries(`${apiUrl}/api/message`, options, { timeout: TIMEOUT });

        if (responseData?.data) {
            if (Array.isArray(responseData.data) && responseData.data.length > 0) {
                return responseData.data[0].response || '✦ No response content.';
            } else {
                return '✦ No response data available. Please try again later.';
            }
        } else if (responseData?.error) {
            console.error('Backend error:', responseData.error);
            return `✦ Error: ${responseData.error}`;
        } else {
            throw new Error('Unexpected response format.');
        }
    } catch (error) {
        console.error('Critical error during send:', error.message);
        return '✦ Unexpected error. Please try again.';
    }
}
