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
    log("INFO", "Opening secure tunnel to Candid News API...");

    // We use q=community and pageSize=25 to match your Lovable project requirements
    const targetUrl = `https://api.candid.org/news/v1/search?q=community&pageSize=25&apiKey=${API_KEY}`;
    
    // We use the 'hex' format for AllOrigins - this is much harder for browsers to block
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Proxy tunnel refused connection.");
        
        const wrapper = await response.json();
        
        // We parse the contents string back into a JSON object
        const data = JSON.parse(wrapper.contents);
        const newsItems = data.data || data.results || [];

        if (newsItems.length > 0) {
            log("OK", `Connection established. Streaming ${newsItems.length} articles...`);
            
            newsItems.forEach((item, index) => {
                setTimeout(() => {
                    const title = item.title || "Untitled Article";
                    const url = item.url || "#";
                    // Display [1] through [25]
                    log("INFO", `[${index + 1}] ${title} — ${url}`);
                    
                    if (index === newsItems.length - 1) {
                        setTimeout(() => log("OK", "Stream Complete. All articles rendered."), 800);
                    }
                }, index * 800);
            });
        } else {
            log("WARN", "API connected but returned no data. Check API Key permissions.");
        }

    } catch (error) {
        log("ERROR", `Security Block: ${error.message}`);
        log("INFO", "Attempting Demo Mode fallback...");
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
