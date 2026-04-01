const streamContainer = document.getElementById('stream-container');
const statusIndicator = document.getElementById('status-indicator');

// Configuration
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_URL = "https://api.candid.org/news/v1/articles"; 
const API_KEY = "7536886f47424dc0a2c4e9dff8b6f0f7";

let articles = [];
let currentIndex = 0;

async function fetchCandidNews() {
    try {
        updateStatus(true);
        
        // TWEAK: Adding 'lang=en' and a random 'cache-buster' timestamp
        const timestamp = new Date().getTime();
        const finalUrl = `${PROXY_URL}${API_URL}?lang=en&v=${timestamp}`;

        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Target the articles array
        articles = data.articles || data.data || []; 
        
        if (articles.length > 0) {
            streamNextArticle();
        } else {
            displayMessage("No English articles found at the moment.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        handleFetchError(error);
    }
}

function handleFetchError(error) {
    updateStatus(false);
    streamContainer.innerHTML = `
        <div class="card" style="border-left: 4px solid #ff3b30;">
            <h3>Stream Connection Error</h3>
            <p>The proxy might need a fresh unlock or your API key is invalid.</p>
            <button onclick="location.reload()" style="margin-top:10px; padding:8px; background:#007AFF; color:white; border:none; border-radius:5px; cursor:pointer;">Retry Now</button>
        </div>`;
}

function updateStatus(isOnline) {
    if (statusIndicator) {
        statusIndicator.textContent = isOnline ? "Live" : "Offline";
        statusIndicator.className = isOnline ? "online" : "offline";
    }
}

function streamNextArticle() {
    if (articles.length === 0) return;
    renderCard(articles[currentIndex]);
    currentIndex = (currentIndex + 1) % articles.length;
}

function renderCard(item) {
    if (document.querySelector('.loading')) streamContainer.innerHTML = '';

    const isAtTop = streamContainer.scrollTop < 10;
    const previousHeight = streamContainer.scrollHeight;

    const card = document.createElement('div');
    card.className = 'card';
    
    // Defaulting to English fallbacks
    const title = item.title || "Latest News Update";
    const description = item.description || item.summary || "No description available in English.";
    const source = item.source || "Candid";

    card.innerHTML = `
        <small>${source} — ${new Date().toLocaleTimeString('en-US')}</small>
        <h3>${title}</h3>
        <p style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>
        <a href="${item.url || '#'}" target="_blank" style="font-size: 0.8rem; color: #007AFF; text-decoration: none; margin-top: 10px; display: inline-block; font-weight: 600;">Read more →</a>
    `;

    streamContainer.prepend(card);

    if (!isAtTop) {
        streamContainer.scrollTop += (streamContainer.scrollHeight - previousHeight);
    }
}

function displayMessage(msg) {
    streamContainer.innerHTML = `<div class="card"><h3>Update</h3><p>${msg}</p></div>`;
}

// Initial Fetch
fetchCandidNews();
setInterval(streamNextArticle, 5000);
// 1. Use the more reliable community proxy
const proxyUrl = "https://cors-anywhere.com/"; 
const targetApi = "https://api.yourdatasource.com/stream"; // Replace with your actual OG API link

const streamContainer = document.getElementById('live-stream');
const statusText = document.getElementById('status-text');

async function launchOgStream() {
    try {
        // Try to fetch real English data
        const response = await fetch(proxyUrl + targetApi);
        if (!response.ok) throw new Error('Proxy limit reached');
        
        const data = await response.json();
        renderData(data);
        
        statusText.innerText = "Online";
        statusText.style.color = "#4CAF50";
    } catch (error) {
        console.warn("Connection issue, reverting to OG Latin Fallback...");
        loadLatinFallback();
    }
}

// 2. The OG Latin Fallback (What you saw when it first started)
function loadLatinFallback() {
    const dummyData = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Vestibulum ante ipsum primis in faucibus orci luctus.",
        "Ut enim ad minim veniam, quis nostrud exercitation."
    ];
    
    statusText.innerText = "Online (Demo Mode)";
    renderData(dummyData);
}

function renderData(items) {
    streamContainer.innerHTML = ''; // Clears the "Error" card
    items.forEach(text => {
        const div = document.createElement('div');
        div.className = 'stream-entry';
        div.innerText = text;
        streamContainer.appendChild(div);
    });
}

launchOgStream();
// 1. The OG Latin Data (Hardcoded so it never says "Waiting")
const ogLatinData = [
    { "id": 1, "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { "id": 2, "text": "Quisque non tellus orci ac auctor augue mauris augue." },
    { "id": 3, "text": "Metus dictum at tempor commodo ullamcorper a lacus." },
    { "id": 4, "text": "Nam libero justo laoreet sit amet cursus sit amet." }
];

// 2. The Reliable Bridge (Bypasses the Heroku "Unlock" button)
const proxy = "https://cors-anywhere.com/"; 
const apiUrl = "https://baconipsum.com/api/?type=all-meat&paras=1";

async function restoreStream() {
    const display = document.querySelector('body'); // Adjust if you have a specific div ID
    
    try {
        // Try to get live Latin from the proxy
        const response = await fetch(proxy + apiUrl);
        const data = await response.json();
        renderStream(data.map(t => ({ text: t })));
    } catch (e) {
        // If Proxy fails, immediately use the OG JSON so the screen isn't blank
        console.log("Proxy blocked. Loading OG Latin JSON...");
        renderStream(ogLatinData);
    }
}

function renderStream(items) {
    // This removes the "Waiting for data..." text
    document.body.innerHTML = '<h2>Live Data Stream</h2><div id="stream-box"></div>';
    const box = document.getElementById('stream-box');
    
    items.forEach(item => {
        const el = document.createElement('div');
        el.style.padding = "15px";
        el.style.borderBottom = "1px solid #eee";
        el.innerText = item.text;
        box.appendChild(el);
    });
}

restoreStream();
