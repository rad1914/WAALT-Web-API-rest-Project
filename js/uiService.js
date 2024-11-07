// uiService.js

/**
 * Adds a message to the conversation.
 * @param {string} content - The message content.
 * @param {string} type - The type of message ('user' or 'bot').
 */
export function addMessageToConversation(content, type = 'bot') {
    const conversation = document.getElementById('conversation');
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', type);
    messageElem.textContent = content;
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

    // Prevent sending with the Enter key
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });

    // Send message when the send button is clicked
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            handleSendMessage(); // Call the function to send the message
        } else {
            alert('Por favor, escribe un mensaje antes de enviar.');
        }
    });
}
