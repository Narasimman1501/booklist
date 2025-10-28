const trendingRow = document.getElementById('trending-row');
const topRow = document.getElementById('top-row');
const popularRow = document.getElementById('popular-row');
const browseRow = document.getElementById('browse-row');
const searchResults = document.getElementById('searchResults');

const loadingTrending = document.getElementById('loading-trending');
const loadingTop = document.getElementById('loading-top');
const loadingPopular = document.getElementById('loading-popular');
const loadingBrowse = document.getElementById('loading-browse');

const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');

const genreFilters = document.getElementById('genre-filters');

const COVER_FALLBACK = 'https://via.placeholder.com/128x193?text=No+Cover';

// Utility function to create a book card HTML element
function createBookCard(book) {
  // Some books may not have cover_i or author_name, check safely
  const coverId = book.cover_i;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : COVER_FALLBACK;

  const title = book.title || 'No Title';
  const author = book.author_name ? book.author_name[0] : 'Unknown Author';
  const year = book.first_publish_year || 'N/A';

  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <img src="${coverUrl}" alt="Cover of ${title}" loading="lazy" />
    <h3>${title}</h3>
    <p class="author"><em>${author}</em></p>
    <p class="year">First published: ${year}</p>
  `;

  return card;
}

// Load books from Open Library API for a given subject
async function loadBooks(subject, container, loadingElement, limit = 10) {
  loadingElement.style.display = 'flex';
  container.innerHTML = '';
  try {
    const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=${limit}`);
    const data = await response.json();
    if (data.works && data.works.length > 0) {
      data.works.forEach(book => {
        container.appendChild(createBookCard(book));
      });
    } else {
      container.innerHTML = '<p>No books found.</p>';
    }
  } catch (error) {
    container.innerHTML = '<p>Error loading books.</p>';
    console.error(error);
  } finally {
    loadingElement.style.display = 'none';
  }
}

// Search books by title, author, or subject
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchResults.innerHTML = '<div class="loading"><div class="spinner"></div>Searching...</div>';

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      searchResults.innerHTML = `<h2>Search Results for "${query}"</h2><div class="book-row"></div>`;
      const row = searchResults.querySelector('.book-row');
      data.docs.forEach(book => {
        row.appendChild(createBookCard(book));
      });
    } else {
      searchResults.innerHTML = `<p>No results found for "${query}".</p>`;
    }
  } catch (error) {
    searchResults.innerHTML = '<p>Error performing search.</p>';
    console.error(error);
  }
}

// Genre filter click handler
async function filterByGenre(event) {
  if (!event.target.dataset.genre) return;

  const genre = event.target.dataset.genre;
  // Clear active class
  Array.from(genreFilters.children).forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  browseRow.innerHTML = '';
  loadingBrowse.style.display = 'flex';

  try {
    await loadBooks(genre, browseRow, loadingBrowse);
  } catch (e) {
    browseRow.innerHTML = '<p>Error loading genre books.</p>';
  }
}

// Theme toggle function
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  themeToggle.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize
function init() {
  // Load initial book lists
  loadBooks('trending', trendingRow, loadingTrending);
  loadBooks('top_rated', topRow, loadingTop);
  loadBooks('popular', popularRow, loadingPopular);

  // Load default browse genre (fantasy)
  loadBooks('fantasy', browseRow, loadingBrowse);

  // Event listeners
  searchBtn.addEventListener('click', searchBooks);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchBooks();
  });

  genreFilters.addEventListener('click', filterByGenre);
  themeToggle.addEventListener('click', toggleTheme);

  // Set theme from localStorage if available
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '🌙';
  } else {
    themeToggle.textContent = '☀️';
  }
}

// Run init on page load
init();
