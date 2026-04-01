const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// This function finds URLs and wraps them in clickable <a> tags
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`;
    });
}

function appendLog(level, message) {
    const now = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `
        <span class="timestamp">${now}</span>
        <span class="tag tag-${level.toLowerCase()}">[${level}]</span>
        <span class="content">${linkify(message)}</span>
    `;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

async function startStream() {
    terminal.innerHTML = ""; 
    appendLog("INFO", "Connecting to Candid News API via AllOrigins Proxy...");
    
    // Correct endpoint for News Search
    const targetUrl = `https://api.candid.org/news/v1/search?apiKey=${API_KEY}`;
    
    // AllOrigins is a more stable proxy for this type of request
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy server returned an error.");
        
        const wrapper = await response.json();
        
        // AllOrigins wraps the result inside a "contents" string
        if (!wrapper.contents) throw new Error("No data received from proxy.");
        
        const data = JSON.parse(wrapper.contents);

        if (data.data && data.data.length > 0) {
            appendLog("OK", `Success! Streaming ${data.data.length} articles...`);
            
            data.data.forEach((article, index) => {
                setTimeout(() => {
                    // This creates the clickable line with Title and URL
                    const msg = `${article.title} — ${article.url}`;
                    appendLog("INFO", msg);
                }, index * 800);
            });
        } else {
            appendLog("WARN", "Connection successful, but no news articles were found.");
        }

    } catch (error) {
        appendLog("ERROR", `Stream failed: ${error.message}`);
        console.error("Full Error Details:", error);
    }
}

connectBtn.addEventListener('click', startStream);
