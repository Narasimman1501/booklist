// script.js

// Local placeholder path for missing covers
const PLACEHOLDER = "placeholder.jpg"; // create this file locally in the same folder

// Elements
const trendingRow = document.getElementById("trending-row");
const topRow = document.getElementById("top-row");
const popularRow = document.getElementById("popular-row");
const searchResults = document.getElementById("searchResults");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");

// Theme toggle
themeToggle.textContent = "🌞";
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "🌞";
});

// Create book card
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const img = document.createElement("img");
  if (book.cover_i) {
    img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
  } else {
    img.src = PLACEHOLDER;
  }
  img.alt = book.title;

  const title = document.createElement("h3");
  title.textContent = book.title || "Unknown Title";

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = book.author_name ? book.author_name.join(", ") : "Unknown Author";

  const year = document.createElement("p");
  year.className = "year";
  year.textContent = book.first_publish_year || "";

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(author);
  card.appendChild(year);

  return card;
}

// Fetch books from Open Library
async function fetchBooks(url, container, limit = 10) {
  container.innerHTML = "<div class='spinner'></div>";
  try {
    const res = await fetch(url);
    const data = await res.json();
    let books = [];
    if (data.docs) {
      books = data.docs.slice(0, limit);
    } else if (data.works) {
      books = data.works.slice(0, limit);
    }
    container.innerHTML = "";
    books.forEach(book => container.appendChild(createBookCard(book)));
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load books</p>";
  }
}

// Load sections
function loadSections() {
  // Trending: let's use subject "fantasy" for example
  fetchBooks("https://openlibrary.org/subjects/fantasy.json?limit=10", trendingRow);

  // Top rated: let's use subject "science_fiction"
  fetchBooks("https://openlibrary.org/subjects/science_fiction.json?limit=10", topRow);

  // Popular: let's use subject "romance"
  fetchBooks("https://openlibrary.org/subjects/romance.json?limit=10", popularRow);
}

// Search function
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return;
  searchResults.innerHTML = "<div class='spinner'></div>";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    searchResults.innerHTML = `<h2>Search Results for "${query}"</h2>`;
    const row = document.createElement("div");
    row.className = "book-row";
    if (data.docs.length === 0) {
      row.innerHTML = "<p>No books found</p>";
    } else {
      data.docs.forEach(book => row.appendChild(createBookCard(book)));
    }
    searchResults.appendChild(row);
  } catch (err) {
    console.error(err);
    searchResults.innerHTML = "<p>Failed to search books</p>";
  }
}

// Event listeners
searchBtn.addEventListener("click", searchBooks);
searchInput.addEventListener("keypress", e => { if (e.key === "Enter") searchBooks(); });

// Initialize
loadSections();
