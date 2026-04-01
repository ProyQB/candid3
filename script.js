const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// Automatically wraps any URL in a clickable <a> tag
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener" class="stream-link">${url}</a>`;
    });
}

function addLine(type, message) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const div = document.createElement('div');
    div.className = 'log-line';
    
    div.innerHTML = `
        <span class="timestamp">${time}</span>
        <span class="label">[${type}]</span>
        <span class="content">${linkify(message)}</span>
    `;
    
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scrolls to bottom
}

async function fetchCandidData() {
    addLine("SYSTEM", "Attempting connection to Candid News...");
    
    // Using a proxy to bypass CORS restrictions
    const proxy = "https://corsproxy.io/?";
    const target = `https://api.candid.org/news/v1/search?apiKey=${API_KEY}`;
    
    try {
        const response = await fetch(proxy + encodeURIComponent(target));
        const json = await response.json();
        
        // Candid API returns an array of objects in 'data'
        const newsItems = json.data || [];
        
        addLine("SUCCESS", `Connected. Streaming ${newsItems.length} records...`);

        // Display results one-by-one to create a "stream" effect
        newsItems.forEach((item, index) => {
            setTimeout(() => {
                const title = item.title || "No Title";
                const link = item.url || "No Link";
                addLine("INFO", `${title} — Source: ${link}`);
            }, index * 1000); // 1 second delay between items
        });

    } catch (err) {
        addLine("ERROR", `Stream failed: ${err.message}`);
    }
}

connectBtn.addEventListener('click', () => {
    terminal.innerHTML = ""; // Clear for new stream
    fetchCandidData();
});
