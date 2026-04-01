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
        
        // Added a "cache buster" (?t=...) to force the browser to bypass the "Blocked" cache
        const cacheBuster = `&t=${new Date().getTime()}`;
        const finalUrl = PROXY_URL + API_URL + "?lang=en" + cacheBuster;

        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) throw new Error("PROXY_LOCKED");
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different possible Candid data structures
        articles = data.articles || data.data || data.results || []; 
        
        if (articles.length > 0) {
            streamNextArticle();
        } else {
            throw new Error("NO_ARTICLES");
        }
    } catch (error) {
        console.error("Stream Error:", error);
        handleFetchError(error);
    }
}

function handleFetchError(error) {
    updateStatus(false);
    let title = "Stream Offline";
    let message = "Check your connection or API key.";

    if (error.message === "PROXY_LOCKED") {
        title = "Action Required";
        message = 'Your browser is still blocking the proxy. Click "Request Access" again at the <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" style="color:white;text-decoration:underline;">Proxy Demo</a> and then refresh this page.';
    }

    streamContainer.innerHTML = `
        <div class="card" style="background: #ff3b30; color: white; border: none;">
            <h3>${title}</h3>
            <p>${message}</p>
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
    const item = articles[currentIndex];
    renderCard(item);
    currentIndex = (currentIndex + 1) % articles.length;
}

function renderCard(item) {
    if (document.querySelector('.loading')) {
        streamContainer.innerHTML = '';
    }

    const isAtTop = streamContainer.scrollTop < 10;
    const previousHeight = streamContainer.scrollHeight;

    const card = document.createElement('div');
    card.className = 'card';
    
    // Ensure English fallbacks
    const title = item.title || "Latest Update";
    const description = item.description || item.summary || "Tap 'Read More' for the full story.";
    const source = item.source || "Candid";
    const link = item.url || "#";

    card.innerHTML = `
        <small>${source} — ${new Date().toLocaleTimeString('en-US')}</small>
        <h3>${title}</h3>
        <p style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>
        <a href="${link}" target="_blank" style="font-size: 0.8rem; color: #007AFF; text-decoration: none; margin-top: 10px; display: inline-block; font-weight: 600;">Read more →</a>
    `;

    streamContainer.prepend(card);

    if (!isAtTop) {
        const heightDiff = streamContainer.scrollHeight - previousHeight;
        streamContainer.scrollTop += heightDiff;
    }
}

fetchCandidNews();
setInterval(streamNextArticle, 5000);
