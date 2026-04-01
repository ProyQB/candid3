const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// Helper to make URLs clickable
function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="stream-link">${url}</a>`);
}

function log(level, message) {
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const div = document.createElement('div');
    div.className = `line ${level.toLowerCase()}`;
    div.innerHTML = `<span class="timestamp">${now}</span> <span class="tag-${level.toLowerCase()}">[${level}]</span> ${linkify(message)}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

async function startStream() {
    terminal.innerHTML = "";
    log("INFO", "▸ Fetching from Candid News API...");

    // Using the exact search query and page size from the Lovable version
    const targetUrl = `https://api.candid.org/news/v1/search?q=*&pageSize=25&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        
        // Safety check for the proxy wrapper
        if (!wrapper.contents) throw new Error("Proxy connection lost");
        
        const data = JSON.parse(wrapper.contents);
        const newsItems = data.data || data.results || [];

        if (newsItems.length > 0) {
            log("OK", "Response received — streaming articles");
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    // Formatting to match the Lovable style: [Source] Title — Date URL
                    const source = item.source_url ? `[${item.source_url}] ` : "";
                    const date = item.published_at ? ` — ${item.published_at.split('T')[0]} ` : "";
                    const title = item.title || "News Update";
                    const url = item.url || "#";
                    
                    log("INFO", `${source}${title}${date}${url}`);
                    
                    if (index === newsItems.length - 1) {
                        setTimeout(() => log("OK", `Stream complete — ${newsItems.length} articles`), 800);
                    }
                }, index * 800);
            });
        } else {
            log("WARN", "No live data found. Loading Demo Mode...");
            loadDemoData();
        }
    } catch (error) {
        log("ERROR", "Connection failed. Ensure API key is active.");
        loadDemoData();
    }
}

function loadDemoData() {
    const demo = [
        "[https://www.northcountrynow.com] Badenhausen Legacy Fund supports 12 local nonprofit organizations — 2026-04-01 https://www.northcountrynow.com/stories/362425",
        "[https://www.newsbug.info] CSL donates to Kankakee County — 2026-04-01 https://www.newsbug.info/iroquois_countys_times-republic/news/article_a5f962ae.html",
        "[https://www.littlerocksoiree.com] Nonprofit News: April Edition — 2026-04-01 https://www.littlerocksoiree.com/nonprofit-news-april-edition-2026/"
    ];
    demo.forEach((item, index) => {
        setTimeout(() => log("INFO", item), index * 800);
    });
}

connectBtn.addEventListener('click', startStream);
