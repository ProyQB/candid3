const streamContainer = document.getElementById('stream-container');
const statusIndicator = document.getElementById('status-indicator');

// Configuration
// Using AllOrigins proxy to avoid the manual "Unlock" button required by Heroku
const PROXY_URL = "https://api.allorigins.win/get?url=";
const API_URL = "https://api.candid.org/news/v1/articles"; 
const API_KEY = "7536886f47424dc0a2c4e9dff8b6f0f7";

let articles = [];
let currentIndex = 0;

/**
 * Fetches news from Candid API via AllOrigins Proxy
 */
async function fetchCandidNews() {
    try {
        updateStatus(true);
        
        // AllOrigins requires the target URL to be encoded
        const targetUrl = encodeURIComponent(API_URL);
        
        // Note: AllOrigins doesn't support custom headers easily in the standard GET 
        // If Candid requires the x-api-key, we append it as a query param if possible
        // or use the proxy's internal logic. 
        const response = await fetch(`${PROXY_URL}${targetUrl}&apikey=${API_KEY}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const wrapper = await response.json();
        
        // AllOrigins wraps the actual API response in a string called 'contents'
        const data = JSON.parse(wrapper.contents);
        
        // Target the correct data array from Candid's response
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

/**
 * Handles error UI states and catches logic failures
 */
function handleFetchError(error) {
    updateStatus(false);
    
    let errorTitle = "Stream Offline";
    let errorText = "We're having trouble connecting to the live feed.";

    if (error.message === "EMPTY_DATA") {
        errorTitle = "No News Found";
        errorText = "The API connected, but no articles were returned.";
    }

    streamContainer.innerHTML = `
        <div class="card" style="border-left: 4px solid #ff3b30; background: #fff5f5;">
            <h3 style="color: #d70015;">${errorTitle}</h3>
            <p>${errorText}</p>
            <button onclick="location.reload()" style="margin-top: 12px; padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Try Again
            </button>
        </div>`;
}

/**
 * Updates the 'Live' indicator in the header
 */
function updateStatus(isOnline) {
    if (statusIndicator) {
        statusIndicator.textContent = isOnline ? "Live" : "Offline";
        statusIndicator.className = isOnline ? "online" : "offline";
    }
}

/**
 * Picks the next article and renders it
 */
function streamNextArticle() {
    if (articles.length === 0) return;

    const item = articles[currentIndex];
    renderCard(item);

    // Loop through the articles
    currentIndex = (currentIndex + 1) % articles.length;
}

/**
 * Renders the Card with Scroll Anchoring
 */
function renderCard(item) {
    if (document.querySelector('.loading')) {
        streamContainer.innerHTML = '';
    }

    // Scroll Anchoring: prevent the page from jumping if user is scrolling
    const isAtTop = streamContainer.scrollTop < 10;
    const previousHeight = streamContainer.scrollHeight;

    const card = document.createElement('div');
    card.className = 'card';
    
    const title = item.title || "Untitled Article";
    const description = item.description || item.summary || "No description available for this update.";
    const source = item.source || "Candid";
    const link = item.url || "#";

    card.innerHTML = `
        <small>${source} — ${new Date().toLocaleTimeString()}</small>
        <h3>${title}</h3>
        <p style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${description}</p>
        <a href="${link}" target="_blank" style="font-size: 0.8rem; color: var(--accent); text-decoration: none; margin-top: 10px; display: inline-block; font-weight: 600;">Read more →</a>
    `;

    streamContainer.prepend(card);

    if (!isAtTop) {
        const heightDiff = streamContainer.scrollHeight - previousHeight;
        streamContainer.scrollTop += heightDiff;
    }
}

// Initial Fetch
fetchCandidNews();

// Stream a new article every 5 seconds
setInterval(streamNextArticle, 5000);
