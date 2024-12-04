// *messageHandler.js

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
 * Toggles the visibility and styles of UI elements.
 * @param {HTMLElement} element - The DOM element to manipulate.
 * @param {boolean} isVisible - Whether the element should be visible.
 * @param {Object} [styles={}] - Optional styles to apply when visible.
 */
function toggleVisibility(element, isVisible, styles = {}) {
    if (!element) return;

    if (isVisible) {
        element.classList.remove('hidden');
        Object.assign(element.style, styles);
    } else {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        setTimeout(() => element.classList.add('hidden'), 300); // Matches transition duration
    }
}

/**
 * Toggles the UI state.
 * @param {boolean} showWelcome - Whether to show the welcome section.
 * @param {boolean} showNewChatButton - Whether to show the new chat button.
 */
function toggleUI(showWelcome, showNewChatButton) {
    const welcomeSection = document.querySelector('.welcome-section');
    const newChatButton = document.querySelector('.new-chat-button');

    toggleVisibility(welcomeSection, showWelcome, { opacity: '1', transform: 'translateY(0)' });
    if (newChatButton) newChatButton.style.display = showNewChatButton ? 'block' : 'none';
}

/**
 * Enables or disables multiple buttons.
 * @param {NodeListOf<HTMLElement>} buttons - A list of buttons to update.
 * @param {boolean} isEnabled - Whether to enable the buttons.
 */
function toggleButtons(buttons, isEnabled) {
    buttons.forEach(button => (button.disabled = !isEnabled));
}

/**
 * Clears the conversation and resets the UI for a new chat session.
 */
export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const messageInput = document.getElementById('messageInput');

    [conversation, responseOutput, messageInput].forEach(el => {
        if (el) el.innerHTML = el.nodeName === 'INPUT' ? '' : '';
    });

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

    // Disable input buttons
    toggleButtons([sendButton, ...helpButtons], false);

    // Clear the input field and transform newline characters (`\n`) to `<br>`
    messageInput.value = '';
    const formattedMessage = message.replace(/\n/g, '<br>'); // Replace only newlines with `<br>`
    addMessageToConversation(formattedMessage, 'user');
    showLoadingMessage();

    // Hide welcome section and show new chat button
    toggleUI(false, true);

    try {
        const userIP = await fetchUserIP();
        if (!userIP || !rateLimiter.isAllowed(userIP)) {
            updateWithBotResponse('Too many requests. Please wait.');
            return;
        }

        const responseText = await sendMessageToServers(message); // Send raw message (without `<br>`)
        updateWithBotResponse(responseText || 'No response received. Try again later.');
    } catch (error) {
        updateWithBotResponse('Error: Could not send the message.');
    } finally {
        // Re-enable input buttons
        toggleButtons([sendButton, ...helpButtons], true);
    }
}

// Initialize the page by hiding the new chat button
document.addEventListener('DOMContentLoaded', () => {
    toggleUI(true, false); // Show welcome section, hide new chat button
});

// Add click event for the "New Chat" button
document.querySelector('.new-chat-button').addEventListener('click', startNewChat);
