// main.js
import { typeTitle } from './js/animators.js';
import { startNewChat } from './js/chat.js';
import { sendMessage } from './js/messageHandler.js';
import { sendButtonMessage } from './js/buttonMessage.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Check if elements exist in the DOM
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    if (!messageInput || !sendButton) {
        console.error("Required elements not found in the DOM");
        return; // Exit early if essential elements are missing
    }

    // Set up basic event listeners to test functionality
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            console.log("Enter pressed in message input");
            sendMessage();
            event.preventDefault();
        }
    });

    sendButton.addEventListener('click', () => {
        console.log("Send button clicked");
        sendMessage();
    });

    // Set up button messages with logging
    document.querySelectorAll('.button-message').forEach(button => {
        button.addEventListener('click', () => {
            const message = button.getAttribute('data-message');
            console.log("Button clicked with message:", message);
            sendButtonMessage(message);
        });
    });

    // Global access for startNewChat button
    window.startNewChat = startNewChat;

    // Start typing animation
    typeTitle();
});
