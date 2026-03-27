const streamContainer = document.getElementById('stream-container');

// Configuration
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_URL = "https://api.candid.org/news/v1/articles"; 
const API_KEY = "7536886f47424dc0a2c4e9dff8b6f0f7";

let articles = [];
let currentIndex = 0;

async function fetchCandidNews() {
    try {
        // We use x-api-key as the header for Candid
        const response = await fetch(PROXY_URL + API_URL, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Target the correct data array from Candid's response
        articles = data.articles || data.data || []; 
        
        if (articles.length > 0) {
            streamNextArticle();
        } else {
            streamContainer.innerHTML = '<div class="card"><h3>No News Found</h3><p>The API returned an empty list.</p></div>';
        }
    } catch (error) {
        console.error("CORS or Fetch error:", error);
        streamContainer.innerHTML = `
            <div class="card" style="border-left: 4px solid #ff3b30;">
                <h3>Connection Required</h3>
                <p>Please click "Request temporary access" at the <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank">CORS Proxy</a> to see live news.</p>
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
