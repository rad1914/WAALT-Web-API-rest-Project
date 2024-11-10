// uiService.js

export function addMessageToConversation(content, type = 'bot') {
    const conversation = document.getElementById('conversation');
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', type);
    messageElem.innerHTML = content;
    conversation.appendChild(messageElem);
    conversation.scrollTop = conversation.scrollHeight;
}

/**
 * Sets up event listeners for the send button and message input field.
 * @param {function} handleSendMessage - The function to call when the send button is clicked.
 */
export function setupEventListeners(handleSendMessage) {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // Send message on button click
    sendButton?.addEventListener('click', handleSendMessage);

    // Prevent sending with Enter key
    messageInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') event.preventDefault();
    });
}
