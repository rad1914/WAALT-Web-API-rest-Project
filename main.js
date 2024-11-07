// main.js
import { sendMessage } from './js/messageHandler.js';
import { addMessageToConversation } from './js/uiService.js';
import { showLoadingMessage, updateWithBotResponse } from './js/utilities.js';
import { typeTitle } from './animators.js';
import { startNewChat, fetchUserIP } from './js/chat.js';

// Function to format the message for the server
function formatMessageForServer(message) {
    return message.startsWith('/') ? message : `.ai ${message}`;
}

// Function for attaching files (placeholder for now)
function handleAttach() {
    alert('Función de adjuntar archivo (puedes implementar la lógica aquí)');
}

// Function to initialize help button listeners
function setupHelpButtonListeners() {
    const helpButtons = document.querySelectorAll('.help-button');
    helpButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            console.log("Help button clicked:", event.target);
            // Perform specific help action
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed");

    // Initialize animations, help button listeners, and fetch user IP
    typeTitle();
    setupHelpButtonListeners();
    await fetchUserIP();  // Ensure IP is fetched before starting a chat session

    // Select buttons and elements
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const helpButton = document.getElementById('helpButton');
    const newChatButton = document.querySelector('.new-chat-button');

    // Debugging log to confirm element loading
    console.log("Elements loaded:", { messageInput, sendButton, helpButton, newChatButton });

    // Verify required elements
    if (!messageInput || !sendButton || !helpButton) {
        console.error("Required elements not found in the DOM");
        return;
    }

    // Add event listener for the send button
    sendButton.addEventListener('click', () => {
        console.log("Send button clicked!");
        sendMessage();
    });

    // Handle the Enter key event
    messageInput.addEventListener('keydown', (event) => {
        console.log("Keydown event on messageInput:", event);
        if (event.key === 'Enter') {
            console.log("Enter pressed, sending message...");
            sendMessage();
            event.preventDefault();
        }
    });

    // Add event listener for the help button
    helpButton.addEventListener('click', () => {
        console.log("Help button clicked!");
        // Add additional logic for the help button here
    });

    // Check and add listener for New Chat button
    if (newChatButton) {
        newChatButton.addEventListener('click', () => {
            console.log("New Chat button clicked!");
            startNewChat(); // Call startNewChat function
        });
    } else {
        console.warn("New Chat button not found.");
    }
});
