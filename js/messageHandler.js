// messageHandler.js

import { addMessageToConversation } from './uiService.js';
import { sendMessageToServers } from './apiService.js';

/**
 * Formats the message to be compatible with server commands.
 * @param {string} message - The message to format.
 * @returns {string} The formatted message.
 */
function formatMessageForServer(message) {
    return message.startsWith('/') ? message : `.ai ${message}`;
}

/**
 * Adds the loading animation for bot response.
 */
function showLoadingMessage() {
    const botMessageId = 'loadingMessage';
    const loadingMessage = document.createElement('div');
    loadingMessage.id = botMessageId;
    loadingMessage.classList.add('bot-message', 'loading');
    loadingMessage.innerText = 'Cargando...';
    document.getElementById('conversation').appendChild(loadingMessage);
}

/**
 * Removes the loading message and updates with the bot's response.
 */
function updateWithBotResponse(responseText) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove(); // Remove loading message
    }
    addMessageToConversation(responseText, 'bot');
}

/**
 * Sends a message entered by the user.
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
