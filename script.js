const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// Helper to make URLs clickable
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`);
}

function log(level, message) {
    const now = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = `line ${level.toLowerCase()}`;
    div.innerHTML = `<span class="timestamp">${now}</span> <span class="tag-${level.toLowerCase()}">[${level}]</span> ${linkify(message)}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

async function startStream() {
    terminal.innerHTML = "";
    log("INFO", "Establishing connection to Candid News...");

    // We use a wildcard search 'q=*' to ensure results return
    const targetUrl = `https://api.candid.org/news/v1/search?q=*&apiKey=${API_KEY}`;
    
    // Using a more direct proxy bypass
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy connection failed.");
        
        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);

        // Map the results from Candid's 'data' array
        const newsItems = data.data || [];

        if (newsItems.length > 0) {
            log("OK", `Success: Streaming ${newsItems.length} news items...`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    const title = item.title || "Untitled Article";
                    const url = item.url || "#";
                    log("INFO", `${title} — ${url}`);
                }, index * 800); // 800ms delay between each line
            });
        } else {
            log("WARN", "Connection established, but no news articles were found for this key.");
        }

    } catch (error) {
        log("ERROR", `Stream Error: ${error.message}`);
        console.error("Full Debug Trace:", error);
    }
}

connectBtn.addEventListener('click', startStream);
