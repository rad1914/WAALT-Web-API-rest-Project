// messageHandler.js

import { 
    fetchUserIP, 
    updateWithBotResponse, 
    showLoadingMessage 
} from './utilities.js';  
import { addMessageToConversation } from './uiService.js';  
import { sendMessageToServers, handshakeWithServer } from './apiService.js';
import RateLimiter from './rateLimiter.js';

const rateLimiter = new RateLimiter(5, 60000);

/**
 * Formats the message to be compatible with server commands.
 * @param {string} message - The message to format.
 * @returns {string} - The formatted message.
 */
function formatMessageForServer(message) {
    return message.startsWith('/') ? message : `.ai ${message}`;
}

/**
 * Sends a message entered by the user and processes the response, with rate limiting and IP caching.
 */
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;

    const sendButton = document.getElementById('sendButton');
    const helpButtons = document.querySelectorAll('.help-button');

    sendButton.disabled = true;
    helpButtons.forEach(button => button.disabled = true);

    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    try {
        const handshakeSuccess = await handshakeWithServer();
        if (!handshakeSuccess) {
            updateWithBotResponse('✦ The server may be temporarily full. Please try again in a few moments.');
            sendButton.disabled = false;
            helpButtons.forEach(button => button.disabled = false);
            return;
        }

        const userIP = await fetchUserIP();
        if (!userIP || !rateLimiter.isAllowed(userIP)) {
            updateWithBotResponse('Too many requests. Please wait before sending more messages.');
            sendButton.disabled = false;
            helpButtons.forEach(button => button.disabled = false);
            return;
        }

        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);
        updateWithBotResponse(responseText || 'No response received. Try again later.');
    } catch (error) {
        updateWithBotResponse('Error: Could not send the message. Please try again later.');
    } finally {
        sendButton.disabled = false;
        helpButtons.forEach(button => button.disabled = false);
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
