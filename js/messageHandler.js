// messageHandler.js

import { 
    fetchUserIP, 
    updateWithBotResponse, 
    showLoadingMessage 
} from './utilities.js';  // No need to change this line
import { addMessageToConversation } from './uiService.js';  // Correct import from uiService
import { sendMessageToServers } from './apiService.js';
import RateLimiter from './rateLimiter.js';

// Initialize RateLimiter: 5 messages every 60 seconds
const rateLimiter = new RateLimiter(5, 60000);

/**
 * Formats the message to be compatible with server commands.
 * @param {string} message - The message to format.
 * @returns {string} The formatted message.
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

    // Disable input elements
    sendButton.disabled = true;
    helpButtons.forEach(button => button.disabled = true);

    // Clear user input and display the message
    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    try {
        // Fetch user IP if not already fetched
        const userIP = await fetchUserIP();
        if (!userIP || !rateLimiter.isAllowed(userIP)) {
            updateWithBotResponse('Too many requests. Please wait before sending more messages.');
            return;
        }

        // Send formatted message to server
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);
        updateWithBotResponse(responseText || 'No response received. Try again later.');
    } catch (error) {
        updateWithBotResponse('Error: No se pudo enviar el mensaje. Inténtalo más tarde.');
    } finally {
        // Re-enable input elements
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
