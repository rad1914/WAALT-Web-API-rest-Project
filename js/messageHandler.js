// messageHandler.js

import { addMessageToConversation } from './uiService.js';
import { sendMessageToServers } from './apiService.js';
import { showLoadingMessage, updateWithBotResponse } from './utilities.js';

/**
 * Formats the message to be compatible with server commands.
 * @param {string} message - The message to format.
 * @returns {string} The formatted message.
 */
function formatMessageForServer(message) {
    return message.startsWith('/') ? message : `.ai ${message}`;
}

/**
 * Sends a message entered by the user and processes the response.
 */
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;

    const sendButton = document.getElementById('sendButton');
    const helpButtons = document.querySelectorAll('.help-button');

    // Disable buttons and clear input
    sendButton.disabled = true;
    helpButtons.forEach(button => button.disabled = true);
    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    try {
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);
        updateWithBotResponse(responseText || 'Error: Respuesta no recibida. Inténtalo más tarde.');
    } catch {
        updateWithBotResponse('Error: No se pudo enviar el mensaje. Inténtalo más tarde.');
    } finally {
        sendButton.disabled = false;
        helpButtons.forEach(button => button.disabled = false);
    }
}

/**
 * Fetches the user's IP address from an external API, with caching.
 */
let userIP = null;
export async function fetchUserIP() {
    if (userIP) return console.log("User IP (cached):", userIP);

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Error fetching IP');
        userIP = (await response.json()).ip;
        console.log("User IP:", userIP);
    } catch {
        console.error('Failed to fetch IP address');
    }
}

/**
 * Starts a new chat session by clearing previous conversation and resetting UI elements.
 */
export function startNewChat() {
    document.getElementById('conversation').innerHTML = '';
    document.getElementById('responseOutput').innerText = '';
    document.getElementById('messageInput').value = '';
    document.getElementById('welcomeSection').classList.replace('slide-down', 'slide-up');
    sessionStorage.clear();
}
