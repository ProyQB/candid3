const API_KEY = '7536886f47424dc0a2c4e9dff8b6f0f7';
const terminal = document.getElementById('terminal');
const connectBtn = document.getElementById('connectBtn');

// This makes URLs clickable
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
    log("INFO", "Fetching from Candid News API...");

    // Using a broader search query to ensure we get data
    const targetUrl = `https://api.candid.org/news/v1/search?q=charity&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);

        // Candid API can return 'data', 'results', or 'articles'
        const newsItems = data.data || data.results || data.articles || [];

        if (newsItems.length > 0) {
            log("OK", `Response received — streaming ${newsItems.length} articles`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    const title = item.title || "Headline";
                    const url = item.url || "https://candid.org";
                    log("INFO", `${title} — ${url}`);
                }, index * 800);
            });
        } else {
            log("WARN", "No live data found for this query. Loading stored demo info...");
            loadDemoData();
        }
    } catch (error) {
        log("ERROR", "Connection failed. Loading stored demo info...");
        loadDemoData();
    }
}

// Fallback data so the screen is never empty
function loadDemoData() {
    const demo = [
        "Nonprofit News: April Edition — https://www.littlerocksoiree.com/nonprofit-news-april-edition-2026/",
        "CSL donates to Kankakee County — https://www.newsbug.info/iroquois_countys_times-republic/news/",
        "Community Center Fund Open — https://www.fiannafail.ie/news/grants"
    ];
    demo.forEach((item, index) => {
        setTimeout(() => log("INFO", item), index * 800);
    });
}

connectBtn.addEventListener('click', startStream);
