const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

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
    log("INFO", "Connecting to Candid News API...");

    // Added 'q=community' to ensure the API has something to search for
    const targetUrl = `https://api.candid.org/news/v1/search?q=community&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        
        if (!wrapper.contents) throw new Error("Blank response from proxy.");
        
        const data = JSON.parse(wrapper.contents);

        // Debug: Log the structure to console so we can see what Candid is sending
        console.log("Candid API Response:", data);

        // Check if data.data exists (Candid's standard format)
        const newsItems = data.data || data.results || [];

        if (newsItems.length > 0) {
            log("OK", `Found ${newsItems.length} articles. Starting stream...`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    const title = item.title || "Untitled Article";
                    const url = item.url || "No URL provided";
                    log("INFO", `${title} — ${url}`);
                }, index * 800);
            });
        } else {
            // If empty, let's report the exact message from Candid
            const msg = data.message || "The API returned 0 results for this query.";
            log("WARN", msg);
        }

    } catch (error) {
        log("ERROR", `System Error: ${error.message}`);
    }
}

connectBtn.addEventListener('click', startStream);
