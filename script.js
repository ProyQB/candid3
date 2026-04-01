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
    log("INFO", "Initializing bypass tunnel...");

    // Candid API Search URL
    const targetUrl = `https://api.candid.org/news/v1/search?q=*&apiKey=${API_KEY}`;
    
    // Using AllOrigins with a 'callback' parameter forces the browser to treat this as a script, 
    // which ignores the "Failed to fetch" security block.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&callback=processData`;

    try {
        const script = document.createElement('script');
        script.src = proxyUrl;
        document.body.appendChild(script);
        
        // Remove the script tag after it loads to keep the HTML clean
        script.onload = () => document.body.removeChild(script);

    } catch (error) {
        log("ERROR", "Connection refused by browser.");
    }
}

// This function is called automatically when the API data returns
window.processData = function(wrapper) {
    try {
        const data = JSON.parse(wrapper.contents);
        const news = data.data || data.results || [];

        if (news.length > 0) {
            log("OK", `Tunnel Open. Streaming ${news.length} articles...`);
            news.forEach((item, index) => {
                setTimeout(() => {
                    log("INFO", `${item.title} — ${item.url}`);
                }, index * 800);
            });
        } else {
            log("WARN", "No data found. Ensure your API key is active for News v1.");
        }
    } catch (e) {
        log("ERROR", "Data format error. The API key might be restricted.");
    }
};

connectBtn.addEventListener('click', startStream);
