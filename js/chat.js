// chat.js

let userIP = null;

const elements = {
    welcomeSection: () => document.getElementById('welcomeSection'),
    newChatButton: () => document.querySelector('.new-chat-button'),
    conversation: () => document.getElementById('conversation'),
    responseOutput: () => document.getElementById('responseOutput'),
    messageInput: () => document.getElementById('messageInput'),
    sendButton: () => document.getElementById('sendButton'),
    helpButtons: () => document.querySelectorAll('.help-button'),
};

export async function fetchUserIP() {
    if (userIP) return userIP;

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error(`Error fetching IP: ${response.statusText}`);

        const data = await response.json();
        userIP = data.ip;
        console.log("User IP:", userIP);
        return userIP;
    } catch (error) {
        console.error('Failed to fetch IP address:', error);
        elements.responseOutput().innerText = 'Error: Unable to fetch IP address.';
        throw error;
    }
}

function toggleChatUI(isWelcomeView) {
    const welcomeSection = elements.welcomeSection();
    const newChatButton = elements.newChatButton();

    if (welcomeSection) {
        welcomeSection.classList.toggle('slide-up', !isWelcomeView);
        welcomeSection.classList.toggle('slide-down', isWelcomeView);
    }

    if (newChatButton) {
        newChatButton.classList.toggle('show-button', !isWelcomeView);
    }
}

function clearFields(...fields) {
    fields.forEach(field => {
        if (field) field.nodeName === 'INPUT' ? (field.value = '') : (field.innerHTML = '');
    });
}

export function startNewChat() {
    clearFields(elements.conversation(), elements.responseOutput(), elements.messageInput());

    toggleVisibility(
        [elements.welcomeSection()],
        'show',
        { opacity: '1', transform: 'translateY(0)' }
    );
    toggleVisibility([elements.newChatButton()], 'hide');

    sessionStorage.clear();
    console.log('Chat cleared and session reset.');
}

export async function sendMessage() {
    const messageInput = elements.messageInput();
    const message = messageInput.value.trim();
    const sendButton = elements.sendButton();
    const helpButtons = elements.helpButtons();
    const newChatButton = elements.newChatButton();

    if (!message) return;

    sendButton.disabled = true;
    helpButtons.forEach(button => (button.disabled = true));
    if (newChatButton) newChatButton.disabled = true;

    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    try {
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);

        updateWithBotResponse(responseText || 'Error: No response received. Try again later.');
    } catch (error) {
        updateWithBotResponse('Error: Unable to send the message. Try again later.');
    } finally {
        sendButton.disabled = false;
        helpButtons.forEach(button => (button.disabled = false));
        if (newChatButton) newChatButton.disabled = false;
    }

    toggleChatUI(false);
}

document.addEventListener('DOMContentLoaded', () => {
    toggleChatUI(true);

    const newChatButton = elements.newChatButton();
    if (newChatButton) {
        newChatButton.addEventListener('click', startNewChat);
        newChatButton.addEventListener('mouseenter', () => newChatButton.classList.add('hovered'));
        newChatButton.addEventListener('mouseleave', () => newChatButton.classList.remove('hovered'));
    }
});