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
    log("INFO", "Tunnel established. Requesting news feed...");

    // We change the query to be blank or very broad to ensure articles are returned
    const targetUrl = `https://api.candid.org/news/v1/search?pageSize=25&apiKey=${API_KEY}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);

        // Check all possible locations where Candid stores news
        const newsItems = data.data || data.results || data.hits || data.items || [];

        if (newsItems.length > 0) {
            log("OK", `Success: ${newsItems.length} articles found.`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    // Candid sometimes uses 'title' or 'headline'
                    const title = item.title || item.headline || "News Update";
                    const url = item.url || item.link || "#";
                    log("INFO", `[${index + 1}] ${title} — ${url}`);
                }, index * 800);
            });
        } else {
            log("WARN", "API returned 0 results. This usually means the API Key needs 'News' permissions enabled.");
            log("INFO", "Loading demo articles for visual verification...");
            loadDemoData();
        }
    } catch (error) {
        log("ERROR", "Data processing error. Check API settings.");
        loadDemoData();
    }
}

function loadDemoData() {
    const demo = [
        "Nonprofit News: April Edition — https://www.littlerocksoiree.com/nonprofit-news-april-edition-2026/",
        "CSL donates to Kankakee County — https://www.newsbug.info/iroquois_countys_times-republic/news/",
        "Community Center Fund Open — https://www.fiannafail.ie/news/grants",
        "Philanthropy Today: New Tech Grants — https://philanthropy.com/article/tech-grants-2026"
    ];
    demo.forEach((item, index) => {
        setTimeout(() => log("INFO", `[DEMO] ${item}`), index * 800);
    });
}

connectBtn.addEventListener('click', startStream);
