const streamContainer = document.getElementById('stream-container');
const statusIndicator = document.getElementById('status-indicator');

// Configuration
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_URL = "https://api.candid.org/news/v1/articles"; 
const API_KEY = "7536886f47424dc0a2c4e9dff8b6f0f7";

let articles = [];
let currentIndex = 0;

/**
 * Fetches news from Candid API via Proxy
 */
async function fetchCandidNews() {
    try {
        const response = await fetch(PROXY_URL + API_URL, {
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
        
        // Target the correct data array from Candid's response
        articles = data.articles || data.data || []; 
        
        if (articles.length > 0) {
            updateStatus(true);
            streamNextArticle();
        } else {
            displayEmptyState("No News Found", "The API returned an empty list.");
        }
    } catch (error) {
        console.error("CORS or Fetch error:", error);
        handleFetchError(error);
    }
}

/**
 * Handles error UI states
 */
function handleFetchError(error) {
    updateStatus(false);
    let message = "Unable to connect to the news stream.";
    let subtext = 'Please check your connection.';

    if (error.message === "PROXY_LOCKED") {
        subtext = `Please click "Request temporary access" at the <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" style="color:white; text-decoration:underline;">CORS Proxy</a> to unlock the stream.`;
    }

    streamContainer.innerHTML = `
        <div class="card" style="background: #ff3b30; color: white;">
            <h3>Connection Blocked</h3>
            <p>${subtext}</p>
        </div>`;
}

/**
 * Updates the 'Live' indicator in the header
 */
function updateStatus(isOnline) {
    statusIndicator.textContent = isOnline ? "Live" : "Offline";
    statusIndicator.className = isOnline ? "online" : "offline";
}

/**
 * Picks the next article and renders it
 */
function streamNextArticle() {
    if (articles.length === 0) return;

    const item = articles[currentIndex];
    renderCard(item);

    currentIndex = (currentIndex + 1) % articles.length;
}

/**
 * Core Render Logic with Scroll Anchoring
 */
function renderCard(item) {
    // Remove loading state on first card
    if (document.querySelector('.loading')) {
        streamContainer.innerHTML = '';
    }

    // TWEAK: Detect if user is reading (not at the top)
    const isAtTop = streamContainer.scrollTop < 10;
    const previousHeight = streamContainer.scrollHeight;

    const card = document.createElement('div');
    card.className = 'card';
    
    const title = item.title || "No Title Available";
    const description = item.description || item.summary || "No description provided.";
    const source = item.source || "Candid News";
    const link = item.url || "#";

    // UX TWEAK: Using CSS classes for text truncation instead of JS substring
    card.innerHTML = `
        <small>${source} — ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        <h3>${title}</h3>
        <p class="description-text">${description}</p>
        <a href="${link}" target="_blank" class="read-more-link">Read more →</a>
    `;

    streamContainer.prepend(card);

    // TWEAK: Scroll Anchoring
    // If user was NOT at the top, maintain their scroll position so the list doesn't jump
    if (!isAtTop) {
        const heightDifference = streamContainer.scrollHeight - previousHeight;
        streamContainer.scrollTop += heightDifference;
    }
}

function displayEmptyState(title, text) {
    streamContainer.innerHTML = `<div class="card"><h3>${title}</h3><p>${text}</p></div>`;
}

// Initial Launch
fetchCandidNews();

// Interval for live feed
setInterval(streamNextArticle, 5000);
