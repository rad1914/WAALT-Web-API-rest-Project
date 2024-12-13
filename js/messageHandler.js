
// *messageHandler.js

import {
    fetchUserIP,
    updateWithBotResponse,
    showLoadingMessage,
    removeLoadingMessage,
    resetUI,
    formatText,
} from './utilities.js';

import { addMessageToConversation } from './uiService.js';
import { sendMessageToServers } from './apiService.js';
import RateLimiter from './rateLimiter.js';

const rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute

/**
 * Toggles the visibility and styles of UI elements.
 * @param {HTMLElement[]} elements - Array of DOM elements to manipulate.
 * @param {string} action - 'show' or 'hide' to control visibility.
 * @param {Object} [styles={}] - Optional styles to apply when visible.
 */
function toggleVisibility(elements, action, styles = {}) {
    elements.forEach(element => {
        if (!element) return;
        if (action === 'show') {
            element.classList.remove('hidden');
            Object.assign(element.style, styles);
            element.style.display = '';
        } else if (action === 'hide') {
            element.style.opacity = '0';
            element.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                element.classList.add('hidden');
                element.style.display = 'none';
            }, 300); // Matches transition duration
        }
    });
}

/**
 * Enables or disables multiple buttons.
 * @param {HTMLElement[]} buttons - A list of buttons to update.
 * @param {boolean} isEnabled - Whether to enable the buttons.
 */
function toggleButtonState(buttons, isEnabled) {
    buttons.forEach(button => button?.setAttribute('disabled', !isEnabled));
}

/**
 * Handles sending a message and processing the server response.
 * @param {string} message - The user's message.
 * @returns {Promise<void>}
 */
async function processMessage(message) {
    const userIP = await fetchUserIP(); // Replace with dynamic IP retrieval logic if unavailable

    if (!rateLimiter.isAllowed(userIP)) {
        const errorMsg = formatText('Too many requests. Please try again later.');
        addMessageToConversation(errorMsg, 'bot');
        return;
    }

    addMessageToConversation(formatText(message), 'user');
    showLoadingMessage();

    try {
        const responseText = await sendMessageToServers(message);
        const response = formatText(responseText || '✦ No response received. Try again later.');
        addMessageToConversation(response, 'bot');
    } catch (error) {
        const errorMsg = formatText(`Error: ${error.message}`);
        addMessageToConversation(errorMsg, 'bot');
        updateWithBotResponse(errorMsg);
    } finally {
        removeLoadingMessage();
    }
}

/**
 * Sends a message and handles the UI interactions.
 */
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const helpButtons = [...document.querySelectorAll('.help-button')];

    const message = messageInput?.value.trim();
    if (!message) return;

    toggleButtonState([sendButton, ...helpButtons], false);
    messageInput.value = '';

    toggleVisibility([document.querySelector('.welcome-section')], 'hide');
    toggleVisibility([document.querySelector('.new-chat-button')], 'show', { opacity: '1', transform: 'translateY(0)' });

    await processMessage(message);

    toggleButtonState([sendButton, ...helpButtons], true);
}

/**
 * Clears the conversation and resets the UI for a new chat session.
 */
/**
 * Clears the conversation and resets the UI for a new chat session.
 */
export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const messageInput = document.getElementById('messageInput');

    // Clear the conversation and input fields
    [conversation, responseOutput, messageInput].forEach(el => {
        if (el) el.innerHTML = el.nodeName === 'INPUT' ? '' : '';
    });

    // Toggle visibility: show welcome section, hide the new chat button
    toggleVisibility(
        [document.querySelector('.welcome-section')],
        'show',
        { opacity: '1', transform: 'translateY(0)' }
    );
    toggleVisibility([document.querySelector('.new-chat-button')], 'hide');
    
    // Clear session storage
    sessionStorage.clear();
    console.log('Chat cleared and session reset.');
}

/**
 * Initialize event listeners and UI elements on page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hide the new chat button initially
    toggleVisibility([document.querySelector('.new-chat-button')], 'hide');

    // Add click event for the "New Chat" button
    document
        .querySelector('.new-chat-button')
        ?.addEventListener('click', startNewChat);
});
