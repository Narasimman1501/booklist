const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('searchResults');
const themeToggle = document.getElementById('themeToggle');

const trendingRow = document.getElementById('trending-row');
const topRow = document.getElementById('top-row');
const popularRow = document.getElementById('popular-row');
const browseRow = document.getElementById('browse-row');

const loadingTrending = document.getElementById('loading-trending');
const loadingTop = document.getElementById('loading-top');
const loadingPopular = document.getElementById('loading-popular');
const loadingBrowse = document.getElementById('loading-browse');

// Theme toggle
themeToggle.addEventListener('click', () => document.body.classList.toggle('dark'));

// Helper: create book card
function createBookCard(book) {
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
    <p class="year">${year}</p>
  `;
  return div;
}

// Fetch books for multiple titles
async function fetchBooks(titles, rowEl, loadingEl) {
  loadingEl.style.display = 'flex';
  rowEl.innerHTML = '';
  for (let title of titles) {
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.docs && data.docs.length > 0) {
        data.docs.slice(0, 3).forEach(book => rowEl.appendChild(createBookCard(book)));
      }
    } catch (err) { console.error(err); }
  }
  loadingEl.style.display = 'none';
}

// Load all sections
function loadAllSections() {
  fetchBooks(["Harry Potter", "The Hobbit", "To Kill a Mockingbird"], trendingRow, loadingTrending);
  fetchBooks(["Pride and Prejudice", "The Great Gatsby", "1984"], topRow, loadingTop);
  fetchBooks(["The Lord of the Rings", "Moby Dick", "Little Women"], popularRow, loadingPopular);
}
loadAllSections();

// Search books
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a search term.");

  searchResults.innerHTML = `<h2>Search Results for "${query}"</h2><div class="loading"><div class="spinner"></div>Loading...</div>`;
  const resultsRow = document.createElement('div');
  resultsRow.className = 'book-row';
  searchResults.appendChild(resultsRow);

  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    searchResults.querySelector('.loading').style.display = 'none';
    if (data.docs && data.docs.length > 0) {
      data.docs.slice(0, 10).forEach(book => resultsRow.appendChild(createBookCard(book)));
    } else {
      resultsRow.innerHTML = "<p>No results found.</p>";
    }
  } catch (err) {
    console.error(err);
    searchResults.querySelector('.loading').style.display = 'none';
    resultsRow.innerHTML
