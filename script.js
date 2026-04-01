const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// 1. Function to find URLs in text and wrap them in <a> tags
function makeLinksClickable(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`;
    });
}

// 2. Function to add a line to the terminal
function appendLog(level, message) {
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false }) + '.' + Math.floor(Math.random() * 1000);
    const line = document.createElement('div');
    line.className = 'line';
    
    const formattedMessage = makeLinksClickable(message);
    
    line.innerHTML = `
        <span class="timestamp">${now}</span>
        <span class="tag tag-${level.toLowerCase()}">[${level}]</span>
        <span class="content">${formattedMessage}</span>
    `;
    
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
}

// 3. The Main Fetch Logic
async function startStream() {
    terminal.innerHTML = ""; // Clear existing logs
    appendLog("INFO", "Connecting to Candid News API via Proxy...");
    
    try {
        // We use a CORS proxy to avoid the browser "CORS error"
        const proxy = "https://corsproxy.io/?";
        const targetUrl = `https://api.candid.org/news/v1?apiKey=${API_KEY}`;
        
        const response = await fetch(proxy + encodeURIComponent(targetUrl));
        
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
        appendLog("OK", `Response received — streaming ${data.articles?.length || 0} articles`);

        // Stream simulation: display articles one by one with a delay
        if (data.articles) {
            data.articles.forEach((article, index) => {
                setTimeout(() => {
                    const message = `[${article.source_url || 'Source'}] ${article.title} — ${article.url}`;
                    appendLog("INFO", message);
                }, index * 850); // 850ms delay between each line
            });
        }

    } catch (error) {
        appendLog("ERROR", `Failed to fetch: ${error.message}. Check API key or CORS settings.`);
    }
}

connectBtn.addEventListener('click', startStream);
