// utilities.js

import { addMessageToConversation } from './uiService.js';

let userIP = null;

export function clearElementContent(id) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
}

export function toggleElementDisplay(id, displayStyle = 'block') {
    const element = document.getElementById(id);
    if (element) element.style.display = displayStyle;
}

function formatText(input) {
    return input
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>') // Negrita
        .replace(/_(.*?)_/g, '<em>$1</em>')          // Cursiva
        .replace(/~(.*?)~/g, '<del>$1</del>')        // Tachado
        .replace(/__(.*?)__/g, '<u>$1</u>')          // Subrayado
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>') // Bloque de código
        .replace(/`(.*?)`/g, '<code>$1</code>')      // Inline código
        .replace(/^\# (.*?)$/gm, '<h1>$1</h1>')      // Encabezado 1
        .replace(/^\## (.*?)$/gm, '<h2>$1</h2>')     // Encabezado 2
        .replace(/^\### (.*?)$/gm, '<h3>$1</h3>')    // Encabezado 3
        .replace(/^\- (.*?)$/gm, '<li>$1</li>')      // Listas
        .replace(/\n/g, '<br>');                     // Saltos de línea
}

export function updateResponseOutput(message) {
    const responseOutput = document.getElementById('responseOutput');
    if (responseOutput) responseOutput.innerHTML = formatText(message);
}

export function showLoadingMessage() {
    const conversation = document.getElementById('conversation');
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loadingMessage';
    loadingMessage.classList.add('bot-message', 'loading');

    // Create dots
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        loadingMessage.appendChild(dot);
    }

    conversation.appendChild(loadingMessage);
    conversation.scrollTop = conversation.scrollHeight;
}


export function updateWithBotResponse(responseText) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) loadingMessage.remove();
    addMessageToConversation(formatText(responseText), 'bot');
}

export async function fetchUserIP() {
    if (userIP) return userIP;
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Error fetching IP');
        userIP = (await response.json()).ip;
        console.log("User IP:", userIP);
        return userIP;
    } catch (error) {
        console.error('Failed to fetch IP:', error);
        return null;
    }
}
