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
        
        // 1. Force English and add a timestamp to bypass the "Blocked" cache
        const finalUrl = `${PROXY_URL}${API_URL}?lang=en&t=${Date.now()}`;

        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                // Removed extra headers that often trigger proxy blocks
            }
        });
        
        if (!response.ok) {
            if (response.status === 403) throw new Error("PROXY_LOCKED");
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // 2. Map the data - Candid usually returns an array named 'articles' or 'data'
        articles = data.articles || data.data || []; 
        
        if (articles.length > 0) {
            streamNextArticle();
        } else {
            // If the API works but is empty, we show a friendly message
            displayMessage("No updates found in English right now.");
        }
    } catch (error) {
        console.error("Stream Error:", error);
        handleFetchError(error);
    }
}

function handleFetchError(error) {
    updateStatus(false);
    if (error.message === "PROXY_LOCKED") {
        streamContainer.innerHTML = `
            <div class="card" style="background: #ff3b30; color: white;">
                <h3>Access Required</h3>
                <p>Click <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" style="color:white;text-decoration:underline;">HERE</a> to unlock the proxy, then refresh this page.</p>
            </div>`;
    } else {
        displayMessage("Stream Offline. Checking connection...");
    }
}

function displayMessage(msg) {
    streamContainer.innerHTML = `<div class="card"><h3>Update</h3><p>${msg}</p></div>`;
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
    
    // Fallbacks to ensure English text appears
    const title = item.title || "News Update";
    const description = item.description || item.summary || "Click below to read the full article.";
    const source = item.source || "Candid News";

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

fetchCandidNews();
setInterval(streamNextArticle, 5000);
