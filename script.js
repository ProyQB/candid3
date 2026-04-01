const streamContainer = document.getElementById('stream-container');
const statusIndicator = document.getElementById('status-indicator');

// Configuration
// SWITCHED: Using AllOrigins to avoid the manual "Unlock" button
const PROXY_URL = "https://api.allorigins.win/get?url=";
const API_URL = "https://api.candid.org/news/v1/articles"; 
const API_KEY = "7536886f47424dc0a2c4e9dff8b6f0f7";

let articles = [];
let currentIndex = 0;

async function fetchCandidNews() {
    try {
        updateStatus(true);
        
        // AllOrigins requires the URL to be encoded
        const targetUrl = encodeURIComponent(`${API_URL}?apikey=${API_KEY}`);
        
        const response = await fetch(`${PROXY_URL}${targetUrl}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const wrapper = await response.json();
        
        // AllOrigins wraps the actual API response in a string called 'contents'
        // We must parse that string to get our data
        const data = JSON.parse(wrapper.contents);
        
        articles = data.articles || data.data || []; 
        
        if (articles.length > 0) {
            streamNextArticle();
        } else {
            throw new Error("EMPTY_DATA");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        handleFetchError(error);
    }
}

function handleFetchError(error) {
    updateStatus(false);
    let errorTitle = "Stream Offline";
    let errorText = "The proxy or API is not responding.";

    if (error.message === "EMPTY_DATA") {
        errorTitle = "No News Found";
        errorText = "The connection is good, but the news list is empty.";
    }

    streamContainer.innerHTML = `
        <div class="card" style="border-left: 4px solid #ff3b30; background: #fff5f5;">
            <h3 style="color: #d70015;">${errorTitle}</h3>
            <p>${errorText}</p>
            <button onclick="location.reload()" style="margin-top: 12px; padding: 8px 16px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Retry Connection
            </button>
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
    
    const title = item.title || "Untitled Update";
    const description = item.description || item.summary || "No description available.";
    const source = item.source || "Candid";
    const link = item.url || "#";

    card.innerHTML = `
        <small>${source} — ${new Date().toLocaleTimeString()}</small>
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
