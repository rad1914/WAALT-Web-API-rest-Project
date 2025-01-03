// *messageHandler.js

import {
    showLoadingMessage,
    removeLoadingMessage,
    formatText,
} from './utilities.js';

import { addMessageToConversation } from './uiService.js';
import { sendMessageToServers } from './apiService.js';
import RateLimiter from './rateLimiter.js';

const rateLimiter = new RateLimiter(5, 60000);

async function processMessage(message) {
    const userIP = await fetchUserIP();

    if (!rateLimiter.isAllowed(userIP)) {
        const errorMsg = formatText('Too many requests. Please try again later.');
        addMessageToConversation(errorMsg, 'bot');
        return;
    }

    addMessageToConversation(formatText(message), 'user');
    showLoadingMessage();

    try {
        const responseText = await sendMessageToServers(message);
        const response = formatText(responseText || '✦ No response received. Try again later.');
        addMessageToConversation(response, 'bot');
    } catch (error) {
        const errorMsg = formatText(`Error: ${error.message}`);
        addMessageToConversation(errorMsg, 'bot');
    } finally {
        removeLoadingMessage();
    }
}

export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const helpButtons = [...document.querySelectorAll('.help-button')];

    const message = messageInput?.value.trim();
    if (!message) return;

    sendButton.disabled = true;
    helpButtons.forEach(button => button.setAttribute('disabled', true));
    messageInput.value = '';

    await processMessage(message);

    sendButton.disabled = false;
    helpButtons.forEach(button => button.removeAttribute('disabled'));
}

export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const messageInput = document.getElementById('messageInput');

    [conversation, responseOutput, messageInput].forEach(el => {
        if (el) el.innerHTML = '';
    });

    sessionStorage.clear();
    console.log('Chat cleared and session reset.');
}

document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelector('.new-chat-button')
        ?.addEventListener('click', startNewChat);
});
