const streamContainer = document.getElementById('stream-container');

// Configuration
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_URL = "https://api.candid.org/news/v1"; 
const API_KEY = "7536886f47424dc0a2c4e9dff8b6f0f7";

let articles = [];
let currentIndex = 0;

async function fetchCandidNews() {
    try {
        // Adding the API key to headers as required by most professional APIs
        const response = await fetch(PROXY_URL + API_URL, {
    headers: {
        'Authorization': `Bearer 7536886f47424dc0a2c4e9dff8b6f0f7`,
        'Content-Type': 'application/json'
    }
});
        
        const data = await response.json();
        
        // Assuming the API returns an array in a field called 'data' or 'articles'
        // Adjust 'data.articles' based on the exact JSON structure
        articles = data.articles || data.data || data; 
        
        if (articles.length > 0) {
            streamNextArticle();
        }
    } catch (error) {
        console.error("CORS or Fetch error:", error);
        // Fallback: Show error in UI
        streamContainer.innerHTML = `<div class="card" style="border-left-color: #ff3b30;">
            <h3>Connection Error</h3>
            <p>Please ensure you have granted temporary access to the <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank">CORS Proxy</a>.</p>
        </div>`;
    }
}

function streamNextArticle() {
    if (articles.length === 0) return;

    const item = articles[currentIndex];
    renderCard(item);

    // Move to next item for the next interval, loop back if at end
    currentIndex = (currentIndex + 1) % articles.length;
}

function renderCard(item) {
    if (document.querySelector('.loading')) {
        streamContainer.innerHTML = '';
    }

    const card = document.createElement('div');
    card.className = 'card';
    
    // Mapping Candid API fields (adjust keys if they differ in your specific response)
    const title = item.title || "No Title Available";
    const description = item.description || item.summary || "No description provided.";
    const source = item.source || "Candid News";
    const link = item.url || "#";

    card.innerHTML = `
        <small>${source} — ${new Date().toLocaleTimeString()}</small>
        <h3>${title}</h3>
        <p>${description.substring(0, 120)}...</p>
        <a href="${link}" target="_blank" style="font-size: 0.8rem; color: var(--accent); text-decoration: none; margin-top: 10px; display: inline-block;">Read more →</a>
    `;

    streamContainer.prepend(card);
}

// Initial Fetch
fetchCandidNews();

// Stream a new article every 5 seconds from the fetched list
setInterval(streamNextArticle, 5000);
