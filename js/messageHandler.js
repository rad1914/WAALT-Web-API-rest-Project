import {
    fetchUserIP,
    updateWithBotResponse,
    showLoadingMessage,
    resetUI,
} from './utilities.js';

import { addMessageToConversation } from './uiService.js';
import { sendMessageToServers } from './apiService.js';
import RateLimiter from './rateLimiter.js';

const rateLimiter = new RateLimiter(5, 60000);

/**
 * Toggles the visibility of elements based on the given state.
 * @param {boolean} showWelcome - Whether to show the welcome section.
 * @param {boolean} showNewChatButton - Whether to show the new chat button.
 */
function toggleUI(showWelcome, showNewChatButton) {
    const welcomeSection = document.querySelector('.welcome-section');
    const newChatButton = document.querySelector('.new-chat-button');

    if (welcomeSection) {
        if (showWelcome) {
            welcomeSection.classList.remove('hidden');
            welcomeSection.style.opacity = '1';
            welcomeSection.style.transform = 'translateY(0)';
        } else {
            welcomeSection.style.opacity = '0';
            welcomeSection.style.transform = 'translateY(-20px)';
            setTimeout(() => welcomeSection.classList.add('hidden'), 300); // Matches transition duration
        }
    }

    if (newChatButton) {
        newChatButton.style.display = showNewChatButton ? 'block' : 'none';
    }
}

/**
 * Clears the conversation and resets the UI for a new chat session.
 */
export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const messageInput = document.getElementById('messageInput');

    if (conversation) conversation.innerHTML = '';
    if (responseOutput) responseOutput.innerText = '';
    if (messageInput) messageInput.value = '';

    toggleUI(true, false); // Show welcome section, hide new chat button
    sessionStorage.clear(); // Clear session data
    console.log('Chat cleared and session reset.');
}

/**
 * Sends a message, updates the UI, and handles server responses.
 */
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;

    const sendButton = document.getElementById('sendButton');
    const helpButtons = document.querySelectorAll('.help-button');

    sendButton.disabled = true;
    helpButtons.forEach(button => (button.disabled = true));

    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    // Hide welcome section and show new chat button
    toggleUI(false, true);

    try {
        const userIP = await fetchUserIP();
        if (!userIP || !rateLimiter.isAllowed(userIP)) {
            updateWithBotResponse('Too many requests. Please wait.');
            return;
        }

        const responseText = await sendMessageToServers(message);
        updateWithBotResponse(responseText || 'No response received. Try again later.');
    } catch (error) {
        updateWithBotResponse('Error: Could not send the message.');
    } finally {
        sendButton.disabled = false;
        helpButtons.forEach(button => (button.disabled = false));
    }
}

// Initialize the page by hiding the new chat button
document.addEventListener('DOMContentLoaded', () => {
    toggleUI(true, false); // Show welcome section, hide new chat button
});

// Add click event for the "New Chat" button
document.querySelector('.new-chat-button').addEventListener('click', startNewChat);
