// DOM elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const listContainer = document.getElementById('bookList');
const loading = document.getElementById('loading');

// Section containers (for trending, top rated, popular)
const trendingContainer = document.getElementById('trendingList');
const topContainer = document.getElementById('topList');
const popularContainer = document.getElementById('popularList');

const trendingLoading = document.getElementById('trendingLoading');
const topLoading = document.getElementById('topLoading');
const popularLoading = document.getElementById('popularLoading');

// Fetch books safely
async function fetchBooks(query, limit = 10) {
  if (!query) return [];
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.docs || [];
  } catch (err) {
    console.error("Failed to fetch books:", err);
    return [];
  }
}

// Render books into a container
function renderBooks(container, books) {
  container.innerHTML = "";
  if (books.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
    return;
  }

  books.forEach(book => {
    const title = book.title || "Unknown Title";
    const author = book.author_name ? book.author_name.join(', ') : "Unknown Author";
    const year = book.first_publish_year || "N/A";
    const coverId = book.cover_i;
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : "https://via.placeholder.com/128x193?text=No+Cover";

    const div = document.createElement('div');
    div.className = 'book-card';
    div.innerHTML = `
      <img src="${coverUrl}" alt="${title}">
      <h3>${title}</h3>
      <p class="author">${author}</p>
      <p class="year">First published: ${year}</p>
    `;
    container.appendChild(div);
  });
}

// Main search function
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a book title!");

  // Show loading
  loading.style.display = "flex";
  listContainer.innerHTML = "";

  const books = await fetchBooks(query, 10);

  // Hide spinner
  loading.style.display = "none";

  renderBooks(listContainer, books);
}

// Load a section (trending, top rated, popular)
async function loadSection(container, spinner, query, limit = 10) {
  spinner.style.display = "flex";
  container.innerHTML = "";

  const books = await fetchBooks(query, limit);

  spinner.style.display = "none";
  renderBooks(container, books);
}

// Search button click
searchBtn.addEventListener('click', searchBooks);

// Press Enter to search
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchBooks();
});

// Automatically load sections on page load
window.addEventListener('load', () => {
  // Load trending, top rated, popular
  loadSection(trendingContainer, trendingLoading, "bestseller");
  loadSection(topContainer, topLoading, "classic literature");
  loadSection(popularContainer, popularLoading, "popular books");

  // Optionally, preload search with trending
  searchInput.value = "bestseller";
  searchBooks();
});
