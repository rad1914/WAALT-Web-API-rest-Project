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
    const helpButtons = document.querySelectorAll('.help-button');

    if (!message) return;

    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true; 

    // Deshabilitar botones de ayuda
    helpButtons.forEach(button => button.disabled = true);

    messageInput.value = '';
    addMessageToConversation(message, 'user');

    showLoadingMessage();

    try {
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);

        if (responseText) {
            updateWithBotResponse(responseText);
        } else {
            updateWithBotResponse('Error: Respuesta no recibida. Inténtalo más tarde.');
        }
    } catch (error) {
        updateWithBotResponse('Error: No se pudo enviar el mensaje. Inténtalo más tarde.');
    } finally {
        sendButton.disabled = false; 
        helpButtons.forEach(button => button.disabled = false); // Habilitar botones de ayuda
    }
}
