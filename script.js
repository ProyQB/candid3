const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// Helper to make URLs clickable
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
    appendLog("INFO", "Connecting to Candid News API...");
    
    // 1. Updated the URL to the correct /search endpoint
    // 2. Switched to a more reliable proxy format
    const targetUrl = `https://api.candid.org/news/v1/search?apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy connection failed");
        
        const wrapper = await response.json();
        // allorigins wraps the result in a .contents string
        const data = JSON.parse(wrapper.contents);

        if (data.data && data.data.length > 0) {
            appendLog("OK", `Connected. Streaming ${data.data.length} articles...`);
            
            data.data.forEach((article, index) => {
                setTimeout(() => {
                    const msg = `${article.title} — ${article.url}`;
                    appendLog("INFO", msg);
                }, index * 800);
            });
        } else {
            appendLog("WARN", "No articles found in the response.");
        }

    } catch (error) {
        appendLog("ERROR", `Stream failed: ${error.message}`);
        console.error(error);
    }
}

connectBtn.addEventListener('click', startStream);
