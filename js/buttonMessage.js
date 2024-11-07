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

// Ensure DOM is fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");

    // Select buttons with the class 'button-message'
    const buttons = document.querySelectorAll('.button-message');

    // Confirm buttons are found
    if (buttons.length === 0) {
        console.warn("Warning: No elements with the class 'button-message' found.");
        return;
    }

    // Add event listeners to each button
    buttons.forEach(button => {
        const message = button.getAttribute('data-message');
        if (message) {
            button.addEventListener('click', () => {
                console.log(`Button clicked with message: ${message}`);
                sendButtonMessage(message);
            });
            console.log(`Event listener added to button with message: ${message}`);
        } else {
            console.warn("Warning: Button is missing the 'data-message' attribute.");
        }
    });
});
