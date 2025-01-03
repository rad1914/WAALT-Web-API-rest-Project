// buttonMessage.js
import { sendMessage } from './messageHandler.js';

export function sendButtonMessage(message) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = message;
        sendMessage(); // Envía el mensaje simulado
    } else {
        console.error("Error: Elemento con ID 'messageInput' no encontrado.");
    }
}
