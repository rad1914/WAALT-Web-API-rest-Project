// chat.js

let userIP = null;

/**
 * Fetches and caches the user's IP address.
 * @returns {Promise<void>}
 */
export async function fetchUserIP() {
    if (userIP) return;

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Error fetching IP');

        const data = await response.json();
        userIP = data.ip;
        console.log("User IP:", userIP);
    } catch (error) {
        console.error('Failed to fetch IP address:', error);
        document.getElementById('responseOutput').innerText = 'Error: Unable to fetch IP address.';
    }
}

/**
 * Toggles the visibility of UI elements like the welcome section and new chat button.
 * @param {boolean} isNewChat - Whether this is a new chat session.
 */
function toggleChatUI(isNewChat) {
    const welcomeSection = document.getElementById('welcomeSection');
    const newChatButton = document.querySelector('.new-chat-button');

    if (isNewChat) {
        if (welcomeSection) {
            welcomeSection.classList.remove('slide-up');
            welcomeSection.classList.add('slide-down');
        }
        if (newChatButton) {
            newChatButton.classList.remove('show-button');
        }
    } else {
        if (welcomeSection) {
            welcomeSection.classList.remove('slide-down');
            welcomeSection.classList.add('slide-up');
        }
        if (newChatButton) {
            newChatButton.classList.add('show-button');
        }
    }
}

/**
 * Clears the chat UI and resets session data for a new conversation.
 */
export function startNewChat() {
    const conversation = document.getElementById('conversation');
    const responseOutput = document.getElementById('responseOutput');
    const messageInput = document.getElementById('messageInput');
    const newChatButton = document.querySelector('.new-chat-button');

    if (conversation) conversation.innerHTML = '';
    if (responseOutput) responseOutput.innerText = '';
    if (messageInput) messageInput.value = '';

    sessionStorage.clear();
    console.log("Chat and session data cleared.");

    // Re-enable the new chat button if disabled during message generation
    if (newChatButton) newChatButton.disabled = false;

    toggleChatUI(true);
}

/**
 * Sends a message, updates the conversation, and transitions the UI.
 */
export async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    const sendButton = document.getElementById('sendButton');
    const helpButtons = document.querySelectorAll('.help-button');
    const newChatButton = document.querySelector('.new-chat-button');

    if (!message) return;

    // Disable send button, help buttons, and new chat button during processing
    sendButton.disabled = true;
    helpButtons.forEach(button => (button.disabled = true));
    if (newChatButton) newChatButton.disabled = true;

    messageInput.value = '';
    addMessageToConversation(message, 'user');
    showLoadingMessage();

    try {
        const formattedMessage = formatMessageForServer(message);
        const responseText = await sendMessageToServers(formattedMessage);

        if (responseText) {
            updateWithBotResponse(responseText);
        } else {
            updateWithBotResponse('Error: No response received. Try again later.');
        }
    } catch (error) {
        updateWithBotResponse('Error: Unable to send the message. Try again later.');
    } finally {
        // Re-enable send button, help buttons, and new chat button after response
        sendButton.disabled = false;
        helpButtons.forEach(button => (button.disabled = false));
        if (newChatButton) newChatButton.disabled = false;
    }

    toggleChatUI(false); // Switch to conversation mode
}

/**
 * Initialize page behavior, including hiding the new chat button on load.
 */
document.addEventListener('DOMContentLoaded', () => {
    toggleChatUI(true); // Show the welcome section and hide the new chat button

    const newChatButton = document.querySelector('.new-chat-button');
    if (newChatButton) {
        newChatButton.addEventListener('click', startNewChat);

        // Optional hover event listeners
        newChatButton.addEventListener('mouseenter', () => {
            newChatButton.classList.add('hovered');
            console.log('Hovering over New Chat button');
        });

        newChatButton.addEventListener('mouseleave', () => {
            newChatButton.classList.remove('hovered');
            console.log('Left New Chat button');
        });
    }
});


/**
 * Add an event listener to the new chat button to start a new session.
 */
document.querySelector('.new-chat-button').addEventListener('click', startNewChat);
