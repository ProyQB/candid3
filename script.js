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
    log("INFO", "Fetching full stream from Candid News API...");

    // 1. Increased pageSize to 25
    // 2. Used a broader query 'community' to ensure a high volume of results
    const targetUrl = `https://api.candid.org/news/v1/search?q=community&pageSize=25&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);

        const newsItems = data.data || data.results || [];

        if (newsItems.length > 0) {
            log("OK", `Connection Success: Found ${newsItems.length} articles.`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    const title = item.title || "Untitled Article";
                    const url = item.url || "#";
                    // Display index number to verify all 25 are appearing
                    log("INFO", `[${index + 1}] ${title} — ${url}`);
                    
                    if (index === newsItems.length - 1) {
                        setTimeout(() => log("OK", `Stream complete — ${newsItems.length} articles displayed.`), 800);
                    }
                }, index * 800);
            });
        } else {
            log("WARN", "API returned 0 results. Reverting to Demo Mode.");
            loadDemoData();
        }
    } catch (error) {
        log("ERROR", "API Error. Check console for details.");
        console.error(error);
        loadDemoData();
    }
}

function loadDemoData() {
    const demo = [
        "Nonprofit News: April Edition — https://www.littlerocksoiree.com/nonprofit-news-april-edition-2026/",
        "CSL donates to Kankakee County — https://www.newsbug.info/iroquois_countys_times-republic/news/",
        "Community Center Fund Open — https://www.fiannafail.ie/news/grants"
    ];
    demo.forEach((item, index) => {
        setTimeout(() => log("INFO", `[DEMO] ${item}`), index * 800);
    });
}

connectBtn.addEventListener('click', startStream);
