// messageHandler 

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

    if (!message) {
        alert('Por favor, escribe un mensaje antes de enviar.');
        return;
    }

    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true; // Disable button while sending

    // Clear input and update UI with user's message
    messageInput.value = '';
    addMessageToConversation(message, 'user');

    // Show loading message from the bot
    showLoadingMessage();

    try {
        // Format message and send it to the server
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);

        // Handle server response
        if (responseText) {
            updateWithBotResponse(responseText);
        } else {
            updateWithBotResponse('Error: Respuesta no recibida. Inténtalo más tarde.');
        }
    } catch (error) {
        console.error('Error with sendMessageToServers:', error);
        updateWithBotResponse('Error: No se pudo enviar el mensaje. Inténtalo más tarde.');
    } finally {
        // Re-enable the send button after the message is sent
        sendButton.disabled = false;
    }
}
