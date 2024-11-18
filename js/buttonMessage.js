// buttonMessage.js
import { sendMessage } from './messageHandler.js';

/**
 * Envía un mensaje predefinido al hacer clic en el botón.
 * @param {string} message - El mensaje que se enviará.
 */
export function sendButtonMessage(message) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = message;
        sendMessage(); // Envía el mensaje simulado
    } else {
        console.error("Error: Elemento con ID 'messageInput' no encontrado.");
    }
}
