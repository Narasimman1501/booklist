const PLACEHOLDER = "https://via.placeholder.com/180x270?text=No+Cover";

const trendingRow = document.getElementById("trending-row");
const topRow = document.getElementById("top-row");
const popularRow = document.getElementById("popular-row");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");

const API_URL = "https://openlibrary.org";

// Helper to create book card
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const img = document.createElement("img");
  img.src = book.cover || PLACEHOLDER;
  img.alt = book.title;

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = book.author || "Unknown Author";

  const year = document.createElement("p");
  year.className = "year";
  year.textContent = book.year || "";

  card.append(img, title, author, year);
  return card;
}

// Fetch books by subject (genre)
async function loadBooks(subject, container, loaderId) {
  const loader = document.getElementById(loaderId);
  loader.style.display = "flex";
  container.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/subjects/${subject}.json?limit=10`);
    const data = await res.json();
    loader.style.display = "none";

    data.works.forEach(work => {
      const book = {
        title: work.title || "No Title",
        author: work.authors && work.authors[0] ? work.authors[0].name : "Unknown Author",
        cover: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` : PLACEHOLDER,
        year: work.first_publish_year || ""
      };
      container.appendChild(createBookCard(book));
    });
  } catch (err) {
    console.error("Error loading books:", err);
    loader.style.display = "none";
    container.innerHTML = `<p>⚠️ Failed to load books.</p>`;
  }
}

// Search books
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a book title or author to search.");

  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = `<div class="loading"><div class="spinner"></div>Searching...</div>`;

  try {
    const res = await fetch(`${API_URL}/search.json?q=${encodeURIComponent(query)}&limit=15`);
    const data = await res.json();

    resultsContainer.innerHTML = `<h2>🔎 Search Results</h2><div class="book-row" id="search-row"></div>`;
    const row = document.getElementById("search-row");

    if (data.docs.length === 0) {
      resultsContainer.innerHTML += `<p>No results found.</p>`;
      return;
    }

    data.docs.forEach(doc => {
      const book = {
        title: doc.title || "No Title",
        author: doc.author_name ? doc.author_name[0] : "Unknown Author",
        cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : PLACEHOLDER,
        year: doc.first_publish_year || ""
      };
      row.appendChild(createBookCard(book));
    });
  } catch (err) {
    console.error("Search failed:", err);
    resultsContainer.innerHTML = `<p>⚠️ Failed to fetch search results.</p>`;
  }
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "🌞";
});

// Event listeners
searchBtn.addEventListener("click", searchBooks);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBooks();
});

// Load initial book sections
loadBooks("fantasy", trendingRow, "loading-trending");
loadBooks("science_fiction", topRow, "loading-top");
loadBooks("romance", popularRow, "loading-popular");
