// utilities.js
import { addMessageToConversation } from './uiService.js';

let userIP = null;

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) console.error(`Element with ID "${id}" not found.`);
    return element;
}

function modifyElement(id, action, value = null) {
    const element = getElement(id);
    if (!element) return;

    switch (action) {
        case 'clear':
            element.innerHTML = '';
            break;
        case 'setContent':
            element.innerHTML = value.content;
            break;
        case 'toggleDisplay':
            if (['block', 'none', 'inline', 'flex'].includes(value.displayStyle)) {
                element.style.display = value.displayStyle;
            } else {
                console.warn(`Invalid display style: ${value.displayStyle}`);
            }
            break;
        case 'resetInput':
            element.value = '';
            break;
        case 'replaceClass':
            element.classList.replace(value.oldClass, value.newClass);
            break;
        case 'remove':
            element.remove();
            break;
    }
}

export function updateResponseOutput(message) {
    modifyElement('responseOutput', 'setContent', { content: formatText(message) });
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
    modifyElement('loadingMessage', 'remove');
    addMessageToConversation(formatText(responseText), 'bot');
}

export function resetUI() {
    ['conversation', 'responseOutput'].forEach(id => modifyElement(id, 'clear'));
    modifyElement('messageInput', 'resetInput');
    modifyElement('welcomeSection', 'replaceClass', { oldClass: 'slide-down', newClass: 'slide-up' });
    sessionStorage.clear();
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
    if (!isValidIP(ip)) {
        console.error(`Invalid or missing IP: ${ip}`);
        return null;
    }
    return `${ip.replace(/\./g, '')}@s.whatsapp.net`;
}

function isValidIP(ip) {
    return /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/.test(ip);
}

function replaceWithTag(pattern, tag, style) {
    return input => input.replace(pattern, `<${tag} style="color: ${style};">$1</${tag}>`);
}


export function formatText(input) {
    if (!input) return '';
    if (typeof input !== 'string') {
        try {
            input = JSON.stringify(input, null, 2);
        } catch (error) {
            console.error('Failed to convert input to string:', error);
            return '';
        }
    }

    const formatStyles = {
        strong: '#ccc',
        em: '#ccc',
        del: '#ccc',
        u: '#ccc',
        h1: '#ccc',
        h2: '#ccc',
        h3: '#ccc',
        li: '#ccc',
        blockquote: '#ccc',
        mark: '#0056b3',
        span: '#007bff',
        code: '#ccc',
    };

    return input
        .replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
            `<pre style="background-color: #121212; color: ${formatStyles.code}; padding: 1em; border-radius: 5px;">
                <code class="${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
            </pre>`
        )
        .replace(/`([^`]+)`/g, `<code style="background-color: #191919; color: ${formatStyles.code}; padding: 0.2em; border-radius: 3px;">$1</code>`)
        .replace(/\*(.*?)\*/g, replaceWithTag(/\*(.*?)\*/g, 'strong', formatStyles.strong))
        .replace(/_(.*?)_/g, replaceWithTag(/_(.*?)_/g, 'em', formatStyles.em))
        .replace(/~(.*?)~/g, replaceWithTag(/~(.*?)~/g, 'del', formatStyles.del))
        .replace(/__(.*?)__/g, replaceWithTag(/__(.*?)__/g, 'u', formatStyles.u))
        .replace(/^# (.*?)$/gm, replaceWithTag(/^# (.*?)$/gm, 'h1', formatStyles.h1))
        .replace(/^## (.*?)$/gm, replaceWithTag(/^## (.*?)$/gm, 'h2', formatStyles.h2))
        .replace(/^### (.*?)$/gm, replaceWithTag(/^### (.*?)$/gm, 'h3', formatStyles.h3))
        .replace(/^- (.*?)$/gm, replaceWithTag(/^- (.*?)$/gm, 'li', formatStyles.li))
        .replace(/^> (.*?)$/gm, input =>
            `<blockquote style="background-color: #121212; color: ${formatStyles.blockquote}; padding: 1em; border-left: 4px solid #0056b3;">$1</blockquote>`
        )
        .replace(/\^\^(.*?)\^\^/g, (_, text) => text.toUpperCase())
        .replace(/--(.*?)--/g, (_, text) => text.toLowerCase())
        .replace(/==(.*?)==/g, replaceWithTag(/==(.*?)==/g, 'mark', formatStyles.mark))
        .replace(/@@(.*?)@@/g, replaceWithTag(/@@(.*?)@@/g, 'span', formatStyles.span))
        .replace(/\|(.*?)\|/gm, (_, cells) => {
            const rows = cells.split('|').map(cell => `<td style="color: ${formatStyles.code};">${cell.trim()}</td>`).join('');
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
