const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// Function to find URLs and turn them into <a> tags
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`;
    });
}

function log(level, message) {
    const now = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML = `
        <span class="timestamp">${now}</span>
        <span class="tag-${level.toLowerCase()}">[${level}]</span>
        <span class="content">${linkify(message)}</span>
    `;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

async function startStream() {
    terminal.innerHTML = ""; 
    log("INFO", "Opening tunnel to Candid API...");

    // We use /search?q=community to ensure we get results back
    const targetUrl = `https://api.candid.org/news/v1/search?q=community&apiKey=${API_KEY}`;
    
    // Using AllOrigins with a cache-buster to prevent "Failed to fetch"
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&callback=?`;

    try {
        // Fetching as text first to avoid CORS JSON pre-flight blocks
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        
        if (!response.ok) throw new Error("Proxy connection refused.");
        
        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);

        if (data.data && data.data.length > 0) {
            log("OK", `Connection established. Streaming ${data.data.length} articles...`);
            
            data.data.forEach((article, index) => {
                setTimeout(() => {
                    const title = article.title || "Untitled News";
                    const url = article.url || "https://candid.org";
                    log("INFO", `${title} — ${url}`);
                }, index * 800);
            });
        } else {
            log("ERROR", "API returned 0 results. Check query parameters.");
        }

    } catch (error) {
        log("ERROR", `Critical Failure: ${error.message}`);
        log("INFO", "Try disabling any ad-blockers that might block proxy scripts.");
    }
}

connectBtn.addEventListener('click', startStream);
