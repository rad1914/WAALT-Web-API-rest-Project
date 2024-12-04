// utilities.js

import { addMessageToConversation } from './uiService.js';

let userIP = null;

function getElement(id) {
    return document.getElementById(id);
}

export function clearElementContent(id) {
    const element = getElement(id);
    if (element) element.innerHTML = '';
}

export function toggleElementDisplay(id, displayStyle = 'block') {
    const element = getElement(id);
    if (element) element.style.display = displayStyle;
}

function formatText(input) {
    if (!input) return '';

    // Multi-line code blocks
    input = input.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre><code class="${lang}">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
    );

    // Inline code
    input = input.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Format various markdown-like syntaxes
    return input
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')    // Bold
        .replace(/_(.*?)_/g, '<em>$1</em>')             // Italics
        .replace(/~(.*?)~/g, '<del>$1</del>')           // Strikethrough
        .replace(/__(.*?)__/g, '<u>$1</u>')             // Underline
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')          // Heading 1
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')         // Heading 2
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')        // Heading 3
        .replace(/^- (.*?)$/gm, '<li>$1</li>')          // List items
        .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>') // Blockquote
        .replace(/\^\^(.*?)\^\^/g, (_, text) => text.toUpperCase()) // Uppercase
        .replace(/--(.*?)--/g, (_, text) => text.toLowerCase()) // Lowercase
        .replace(/==(.*?)==/g, '<mark>$1</mark>')       // Highlight
        .replace(/@@(.*?)@@/g, '<span style="color: red;">$1</span>') // Red text
        .replace(/\|(.*?)\|/gm, (_, cells) => {
            const rows = cells.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<table><tr>${rows}</tr></table>`;
        })
        .replace(/\{([1-9])\}(.*?)\{\/\1\}/g, '<span style="font-size:$1em;">$2</span>') // Font size
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // Links
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">') // Images
        .replace(/\$\$(.*?)\$\$/gs, '<div class="math-block">\\[$1\\]</div>') // Block math
        .replace(/\$(.*?)\$/g, '<span class="math-inline">\\($1\\)</span>') // Inline math
        .replace(/\n/g, '<br>'); // Line breaks
}

function updateElementContent(id, content, formatter = null) {
    const element = getElement(id);
    if (element) element.innerHTML = formatter ? formatter(content) : content;
}

export function updateResponseOutput(message) {
    updateElementContent('responseOutput', message, formatText);
}

export function showLoadingMessage() {
    const conversation = getElement('conversation');
    if (!conversation) return;

    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loadingMessage';
    loadingMessage.classList.add('bot-message', 'loading');

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.textContent = '.';
        loadingMessage.appendChild(dot);
    }

    conversation.appendChild(loadingMessage);
}

export function updateWithBotResponse(responseText) {
    const loadingMessage = getElement('loadingMessage');
    if (loadingMessage) loadingMessage.remove();
    addMessageToConversation(formatText(responseText), 'bot');
}

export async function fetchUserIP() {
    if (userIP) return userIP;
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Error fetching IP');
        const data = await response.json();
        userIP = data.ip;
        console.log("User IP:", userIP);
        return userIP;
    } catch (error) {
        console.error('Failed to fetch IP:', error);
        return null;
    }
}

export function resetUI() {
    ['conversation', 'responseOutput'].forEach(clearElementContent);
    const messageInput = getElement('messageInput');
    if (messageInput) messageInput.value = '';
    const welcomeSection = getElement('welcomeSection');
    if (welcomeSection) welcomeSection.classList.replace('slide-down', 'slide-up');
    sessionStorage.clear();
}
