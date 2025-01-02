
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

const rateLimiter = new RateLimiter(5, 60000);

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
            }, 300);
        }
    });
}

function toggleButtonState(buttons, isEnabled) {
    buttons.forEach(button => button?.setAttribute('disabled', !isEnabled));
}

async function processMessage(message) {
    const userIP = await fetchUserIP();

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

export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const messageInput = document.getElementById('messageInput');

    [conversation, responseOutput, messageInput].forEach(el => {
        if (el) el.innerHTML = el.nodeName === 'INPUT' ? '' : '';
    });

    toggleVisibility(
        [document.querySelector('.welcome-section')],
        'show',
        { opacity: '1', transform: 'translateY(0)' }
    );
    toggleVisibility([document.querySelector('.new-chat-button')], 'hide');
    
    sessionStorage.clear();
    console.log('Chat cleared and session reset.');
}

document.addEventListener('DOMContentLoaded', () => {
    toggleVisibility([document.querySelector('.new-chat-button')], 'hide');

    document
        .querySelector('.new-chat-button')
        ?.addEventListener('click', startNewChat);
});