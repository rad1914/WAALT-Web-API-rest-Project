// uiService.js

export function addMessageToConversation(content, type = 'bot') {
    const conversation = document.getElementById('conversation');
    if (!conversation) {
        console.error('Conversation element not found');
        return;
    }

    const messageElem = document.createElement('div');
    messageElem.classList.add('message', type);
    messageElem.innerHTML = content;

    conversation.appendChild(messageElem);
    conversation.scrollTop = conversation.scrollHeight;

    console.log(`Added message: ${content}`);
}

function addEventListenerIfExists(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

function adjustTextareaHeight(textarea) {
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
}

export function setupEventListeners(handleSendMessage) {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    addEventListenerIfExists(sendButton, 'click', handleSendMessage);

    addEventListenerIfExists(messageInput, 'keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

    addEventListenerIfExists(messageInput, 'input', () =>
        adjustTextareaHeight(messageInput)
    );
}
