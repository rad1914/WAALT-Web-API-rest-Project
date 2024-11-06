// buttonMessage.js
import { sendMessage } from './messageHandler.js';

/**
 * Sends a predefined message by simulating a button click.
 * @param {string} message - The message to send.
 */
export function sendButtonMessage(message) {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.value = message;
        sendMessage(); // Call sendMessage without parameters
    } else {
        console.error("Error: Element with ID 'messageInput' not found.");
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
