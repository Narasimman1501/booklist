// script.js

// DOM Elements
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const themeToggle = document.getElementById('themeToggle');

const trendingRow = document.getElementById('trending-row');
const topRow = document.getElementById('top-row');
const popularRow = document.getElementById('popular-row');
const browseRow = document.getElementById('browse-row');
const searchResults = document.getElementById('searchResults');

const loadingTrending = document.getElementById('loading-trending');
const loadingTop = document.getElementById('loading-top');
const loadingPopular = document.getElementById('loading-popular');
const loadingBrowse = document.getElementById('loading-browse');

// Utility: create book card
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';

    const img = document.createElement('img');
    img.src = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : 'https://placehold.co/180x270?text=No+Cover';
    img.alt = book.title;

    const title = document.createElement('h3');
    title.textContent = book.title;

    const author = document.createElement('p');
    author.className = 'author';
    author.textContent = book.author_name ? book.author_name.join(', ') : 'Unknown Author';

    const year = document.createElement('p');
    year.className = 'year';
    year.textContent = book.first_publish_year || '';

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(year);

    return card;
}

// Utility: fetch books from Open Library
async function fetchBooks(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.docs || [];
    } catch (err) {
        console.error('Fetch error:', err);
        return [];
    }
}

// Load section with books
async function loadSection(url, container, loader) {
    loader.style.display = 'flex';
    const books = await fetchBooks(url);
    loader.style.display = 'none';
    container.innerHTML = '';
    books.slice(0, 10).forEach(book => container.appendChild(createBookCard(book)));
}

// Initial load
loadSection('https://openlibrary.org/search.json?q=trending', trendingRow, loadingTrending);
loadSection('https://openlibrary.org/search.json?q=top+rated', topRow, loadingTop);
loadSection('https://openlibrary.org/search.json?q=popular', popularRow, loadingPopular);

// Browse by genre
const genreButtons = document.querySelectorAll('#genre-filters button');
genreButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        genreButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const genre = btn.dataset.genre;
        loadingBrowse.style.display = 'flex';
        const books = await fetchBooks(`https://openlibrary.org/subjects/${genre}.json?limit=10`);
        loadingBrowse.style.display = 'none';
        browseRow.innerHTML = '';
        (books.works || []).forEach(book => browseRow.appendChild(createBookCard(book)));
    });
});

// Search functionality
async function searchBooks() {
    const query = searchInput.value.trim();
    if (!query) return;
    searchResults.innerHTML = '<div class="loading"><div class="spinner"></div>Searching...</div>';
    const books = await fetchBooks(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    searchResults.innerHTML = `<h2>Search Results for "${query}"</h2>`;
    const row = document.createElement('div');
    row.className = 'book-row';
    books.slice(0, 20).forEach(book => row.appendChild(createBookCard(book)));
    searchResults.appendChild(row);
}

searchBtn.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchBooks();
});

// Theme toggle
function updateTheme() {
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '🌞' : '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    updateTheme();
});

// Set initial theme icon
updateTheme();
