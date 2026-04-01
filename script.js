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
    log("INFO", "Bypassing browser security filters...");

    // We change 'q=community' to 'q=*' to get ALL recent news
    const targetUrl = `https://api.candid.org/news/v1/search?q=*&apiKey=${API_KEY}`;
    
    // We switch to a more transparent proxy to avoid the "Blue Denied" error
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`;

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Proxy connection denied.");

        const wrapper = await response.json();
        
        if (!wrapper.contents) throw new Error("API returned an empty tunnel.");
        
        const data = JSON.parse(wrapper.contents);

        // Standardizing the response path
        const newsItems = data.data || data.results || [];

        if (newsItems.length > 0) {
            log("OK", `Success! Found ${newsItems.length} news events.`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    // Pulling Title and URL
                    const title = item.title || "Headline Unavailable";
                    const url = item.url || "https://candid.org";
                    log("INFO", `${title} — Source: ${url}`);
                }, index * 600); // Faster stream speed
            } );
        } else {
            // If the API says 0, it might be the Key's permissions
            log("WARN", "Candid API connected, but returned 0 articles for this key.");
            log("INFO", "Check your Candid Dashboard for 'News API' activation status.");
        }

    } catch (error) {
        log("ERROR", `Security Block: ${error.message}`);
        console.log("%c SECURITY ALERT: If you see 'Denied' in blue below, it means the browser is blocking the Proxy. Try a different browser or disable Ad-Block.", "color: blue; font-weight: bold;");
    }
}

connectBtn.addEventListener('click', startStream);
