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
