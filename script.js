const streamContainer = document.getElementById('stream-container');
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Placeholder API

async function fetchData() {
    try {
        // We append a random ID or timestamp to simulate "new" data in the stream
        const response = await fetch(PROXY_URL + API_URL);
        const data = await response.json();
        
        // Pick a random item to simulate a "new" stream event
        const randomItem = data[Math.floor(Math.random() * data.length)];
        renderCard(randomItem);
        
    } catch (error) {
        console.error("CORS or Fetch error:", error);
    }
}

function renderCard(item) {
    // Remove loading text on first load
    if (document.querySelector('.loading')) {
        streamContainer.innerHTML = '';
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <small>ID: ${item.id} — ${new Date().toLocaleTimeString()}</small>
        <h3>${item.title.substring(0, 30)}...</h3>
        <p>${item.body.substring(0, 80)}...</p>
    `;

    // Add to the top of the stream
    streamContainer.prepend(card);
}

// Start the stream: Fetches new data every 3 seconds
setInterval(fetchData, 3000);

// Initial call
fetchData();
