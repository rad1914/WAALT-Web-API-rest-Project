// messageHandler.js

import {
    fetchUserIP,
    updateWithBotResponse,
    showLoadingMessage,
    resetUI
} from './utilities.js';

import { addMessageToConversation } from './uiService.js';
import { sendMessageToServers } from './apiService.js';
import RateLimiter from './rateLimiter.js';

const rateLimiter = new RateLimiter(5, 60000);

function formatMessageForServer(message) {
    return message.startsWith('/') ? message : `.ai ${message}`;
}

export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;

    const sendButton = document.getElementById('sendButton');
    const helpButtons = document.querySelectorAll('.help-button');

    sendButton.disabled = true;
    helpButtons.forEach(button => (button.disabled = true));

    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    try {
        const userIP = await fetchUserIP();
        if (!userIP || !rateLimiter.isAllowed(userIP)) {
            updateWithBotResponse('Too many requests. Please wait.');
            return;
        }

        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);
        updateWithBotResponse(responseText || 'No response received. Try again later.');
    } catch (error) {
        updateWithBotResponse('Error: No se pudo enviar el mensaje.');
    } finally {
        sendButton.disabled = false;
        helpButtons.forEach(button => (button.disabled = false));
    }
}

export function startNewChat() {
    resetUI();
}
