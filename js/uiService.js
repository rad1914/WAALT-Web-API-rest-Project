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
        if (event.key === 'Enter') event.preventDefault();
    });
}
