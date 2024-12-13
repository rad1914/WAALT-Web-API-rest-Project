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

    Array.from({ length: 3 }).forEach(() => {
        const dot = document.createElement('span');
        dot.textContent = '.';
        loadingMessage.appendChild(dot);
    });

    conversation.appendChild(loadingMessage);
}

export function updateWithBotResponse(responseText) {
    const loadingMessage = getElement('loadingMessage');
    if (loadingMessage) loadingMessage.remove();
    addMessageToConversation(formatText(responseText), 'bot');
}

export function resetUI() {
    ['conversation', 'responseOutput'].forEach(clearElementContent);
    const messageInput = getElement('messageInput');
    if (messageInput) messageInput.value = '';
    const welcomeSection = getElement('welcomeSection');
    if (welcomeSection) welcomeSection.classList.replace('slide-down', 'slide-up');
    sessionStorage.clear();
}

export function removeLoadingMessage() {
    const loadingMessage = getElement('loadingMessage');
    if (loadingMessage) loadingMessage.remove();
}

function isValidIP(ip) {
    return /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/.test(ip);
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

export function convertIPToJID(ip) {
    if (!ip || !isValidIP(ip)) {
        console.error('Invalid or missing IP:', ip);
        return null;
    }
    const jid = `${ip.replace(/\./g, '')}@s.whatsapp.net`;
    console.log("Formatted JID:", jid);
    return jid;
}

export function formatText(input) {
    if (!input) return '';

    input = input.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre><code class="${lang}">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
    );

    input = input.replace(/`([^`]+)`/g, '<code>$1</code>');

    return input
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~(.*?)~/g, '<del>$1</del>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
        .replace(/\^\^(.*?)\^\^/g, (_, text) => text.toUpperCase())
        .replace(/--(.*?)--/g, (_, text) => text.toLowerCase())
        .replace(/==(.*?)==/g, '<mark>$1</mark>')
        .replace(/@@(.*?)@@/g, '<span style="color: red;">$1</span>')
        .replace(/\|(.*?)\|/gm, (_, cells) => {
            const rows = cells.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<table><tr>${rows}</tr></table>`;
        })
        .replace(/\{([1-9])\}(.*?)\{\/\1\}/g, '<span style="font-size:$1em;">$2</span>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replace(/\$\$(.*?)\$\$/gs, '<div class="math-block">\\[$1\\]</div>')
        .replace(/\$(.*?)\$/g, '<span class="math-inline">\\($1\\)</span>')
        .replace(/\n/g, '<br>');
}
