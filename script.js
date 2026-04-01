const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// Automatically turns text URLs into clickable blue links
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`;
    });
}

function appendLog(level, message) {
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
    appendLog("INFO", "Bypassing CORS filters and connecting to Candid...");

    // Using the 'allorigins' wrapper which is more successful on GitHub Pages
    const targetUrl = `https://api.candid.org/news/v1/search?apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const wrapper = await response.json();
        
        // The actual API data is inside wrapper.contents as a string
        const data = JSON.parse(wrapper.contents);

        if (data.data && data.data.length > 0) {
            appendLog("OK", `Success! Found ${data.data.length} articles.`);
            
            data.data.forEach((article, index) => {
                setTimeout(() => {
                    const title = article.title || "News Update";
                    const url = article.url || "https://candid.org";
                    appendLog("INFO", `${title} — ${url}`);
                }, index * 850);
            });
        } else {
            appendLog("ERROR", "No data found. Check if your API key has 'News v1' permissions.");
        }

    } catch (error) {
        appendLog("ERROR", `Connection Failed: ${error.message}`);
        console.error("Diagnostic Info:", error);
    }
}

connectBtn.addEventListener('click', startStream);
