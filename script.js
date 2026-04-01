const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, url => `<a href="${url}" target="_blank" class="stream-link">${url}</a>`);
}

function log(level, message) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML = `<span class="time">${time}</span><span class="tag-${level.toLowerCase()}">[${level}]</span> ${linkify(message)}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

async function startStream() {
    terminal.innerHTML = "";
    log("INFO", "Connecting to Candid News API...");

    // Using corsproxy.io which is usually faster/simpler
    const target = `https://api.candid.org/news/v1/search?apiKey=${API_KEY}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(target)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Connection failed");
        
        const data = await response.json();
        
        // Candid API returns news in the 'data' array
        const news = data.data || [];
        log("INFO", `Connection successful. Streaming ${news.length} articles...`);

        news.forEach((item, index) => {
            setTimeout(() => {
                const content = `${item.title} — ${item.url}`;
                log("INFO", content);
            }, index * 800);
        });

    } catch (err) {
        log("ERROR", `Stream failed: Check if API key is active or proxy is up.`);
        console.error(err);
    }
}

connectBtn.addEventListener('click', startStream);
