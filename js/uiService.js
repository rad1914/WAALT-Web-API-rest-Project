// uiService.js

export function addMessageToConversation(content, type = 'bot') {
    const conversation = document.getElementById('conversation');
    const messageElem = document.createElement('div');
    messageElem.classList.add('message', type);
    messageElem.innerHTML = content;
    conversation.appendChild(messageElem);
    conversation.scrollTop = conversation.scrollHeight;
}

export function setupEventListeners(handleSendMessage) {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    sendButton?.addEventListener('click', handleSendMessage);

    messageInput?.addEventListener('keydown', (event) => {
        // Prevent default action when pressing Enter but allow Shift+Enter for new line
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

    messageInput?.addEventListener('input', () => {
        // Dynamic resizing
        messageInput.style.height = 'auto';
        messageInput.style.height = `${messageInput.scrollHeight}px`;
    });
}
