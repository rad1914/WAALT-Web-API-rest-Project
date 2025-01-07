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
        console.log('User IP:', userIP);
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
    console.log('Formatted JID:', jid);
    return jid;
}

export function formatText(input) {
    if (!input) return '';
    if (typeof input !== 'string') {
        // Convert non-string input to a string if possible
        try {
            input = JSON.stringify(input, null, 2);
        } catch (error) {
            console.error('Failed to convert input to string:', error);
            return '';
        }
    }

    input = input.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre style="background-color: #121212; color: #ccc; padding: 1em; border-radius: 5px;">
            <code class="${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
        </pre>`
    );

    input = input.replace(/`([^`]+)`/g, '<code style="background-color: #191919; color: #ccc; padding: 0.2em; border-radius: 3px;">$1</code>');

    return input
        .replace(/\*(.*?)\*/g, '<strong style="color: #ccc;">$1</strong>')
        .replace(/_(.*?)_/g, '<em style="color: #ccc;">$1</em>')
        .replace(/~(.*?)~/g, '<del style="color: #ccc;">$1</del>')
        .replace(/__(.*?)__/g, '<u style="color: #ccc;">$1</u>')
        .replace(/^# (.*?)$/gm, '<h1 style="color: #ccc;">$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2 style="color: #ccc;">$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3 style="color: #ccc;">$1</h3>')
        .replace(/^- (.*?)$/gm, '<li style="color: #ccc;">$1</li>')
        .replace(/^> (.*?)$/gm, '<blockquote style="background-color: #121212; color: #ccc; padding: 1em; border-left: 4px solid #0056b3;">$1</blockquote>')
        .replace(/\^\^(.*?)\^\^/g, (_, text) => text.toUpperCase())
        .replace(/--(.*?)--/g, (_, text) => text.toLowerCase())
        .replace(/==(.*?)==/g, '<mark style="background-color: #0056b3; color: #ccc;">$1</mark>')
        .replace(/@@(.*?)@@/g, '<span style="color: #007bff;">$1</span>')
        .replace(/\|(.*?)\|/gm, (_, cells) => {
            const rows = cells.split('|').map(cell => `<td style="color: #ccc;">${cell.trim()}</td>`).join('');
            return `<table style="border-collapse: collapse; width: 100%; background-color: #121212;">
                        <tr>${rows}</tr>
                    </table>`;
        })
        .replace(/\{([1-9])\}(.*?)\{\/\1\}/g, '<span style="font-size:$1em; color: #ccc;">$2</span>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #0056b3; text-decoration: none;">$1</a>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 5px;">')
        .replace(/\$\$(.*?)\$\$/gs, '<div class="math-block" style="color: #ccc;">\\[$1\\]</div>')
        .replace(/\$(.*?)\$/g, '<span class="math-inline" style="color: #ccc;">\\($1\\)</span>')
        .replace(/\n/g, '<br>');
}