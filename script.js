const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// This function makes any URL in the text clickable
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`;
    });
}

function log(level, message) {
    const now = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = `line ${level.toLowerCase()}`;
    div.innerHTML = `<span class="time">${now}</span> <span class="tag">[${level}]</span> ${linkify(message)}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

async function startStream() {
    terminal.innerHTML = "";
    log("INFO", "Initiating secure tunnel to Candid News API...");

    // Using the 'allorigins' hex-encoded method to prevent proxy blocking
    const target = `https://api.candid.org/news/v1/search?apiKey=${API_KEY}`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

    try {
        const response = await fetch(proxy);
        
        if (!response.ok) throw new Error("Proxy Server Unreachable");

        const wrapper = await response.json();
        
        // AllOrigins returns the API data as a string inside 'contents'
        if (!wrapper.contents) throw new Error("Empty response from API");
        
        const data = JSON.parse(wrapper.contents);

        // Check if Candid returned an error message inside the JSON
        if (data.error || data.message === "Unauthorized") {
            throw new Error(data.message || "Invalid API Key");
        }

        const newsItems = data.data || [];
        log("OK", `Connection Verified. Streaming ${newsItems.length} articles...`);

        newsItems.forEach((item, index) => {
            setTimeout(() => {
                const title = item.title || "Untitled Article";
                const url = item.url || "#";
                log("INFO", `${title} — ${url}`);
            }, index * 800);
        });

    } catch (err) {
        log("ERROR", `Status: ${err.message}`);
        log("SYSTEM", "Tip: Ensure your Candid API key is active for 'News v1' in your dashboard.");
    }
}

connectBtn.addEventListener('click', startStream);
