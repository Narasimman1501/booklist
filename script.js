// Get elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('searchResults');
const themeToggle = document.getElementById('themeToggle');

// Section containers and loaders
const sections = {
  trending: { row: document.getElementById('trending-row'), loader: document.getElementById('loading-trending') },
  top: { row: document.getElementById('top-row'), loader: document.getElementById('loading-top') },
  popular: { row: document.getElementById('popular-row'), loader: document.getElementById('loading-popular') },
  browse: { row: document.getElementById('browse-row'), loader: document.getElementById('loading-browse') }
};

// Toggle dark/light theme
themeToggle.addEventListener('click', () => document.body.classList.toggle('dark'));

// Helper: fetch books from OpenLibrary
async function fetchBooks(query, limit = 10) {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    return data.docs || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Render books in a horizontal row
function renderBooks(container, books) {
  container.innerHTML = '';
  if (!books.length) {
    container.innerHTML = '<p>No books found.</p>';
    return;
  }
  books.forEach(book => {
    const title = book.title || 'Unknown Title';
    const author = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
    const year = book.first_publish_year || 'N/A';
    const coverId = book.cover_i;
    const coverUrl = coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : 'https://via.placeholder.com/128x193?text=No+Cover';

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

// Load section (trending, top, popular, browse)
async function loadSection(sectionKey, query) {
  const section = sections[sectionKey];
  if (!section) return;

  section.loader.style.display = 'flex';
  section.row.innerHTML = '';
  const books = await fetchBooks(query, 15);
  renderBooks(section.row, books);
  section.loader.style.display = 'none';
}

// Load all sections on page load
async function loadAllSections() {
  await loadSection('trending', 'best sellers');
  await loadSection('top', 'top rated books');
  await loadSection('popular', 'popular books');
}

// Search books
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return alert('Please enter a book title!');

  // Show search loader
  searchResults.innerHTML = `<div class="loading"><div class="spinner"></div>Loading results...</div>`;

  const books = await fetchBooks(query, 15);
  searchResults.innerHTML = `<h2>Search Results for "${query}"</h2>`;
  const row = document.createElement('div');
  row.className = 'book-row';
  searchResults.appendChild(row);

  renderBooks(row, books);
}

// Browse by genre
document.getElementById('genre-filters').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const genre = e.target.dataset.genre;
    document.querySelectorAll('#genre-filters button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    loadSection('browse', genre);
  }
});

// Event listeners
searchBtn.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchBooks(); });

// Initialize page
window.addEventListener('load', () => {
  loadAllSections();
  // Optionally load default genre
  loadSection('browse', 'fantasy');
});
