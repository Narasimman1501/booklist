const themeToggle = document.getElementById('themeToggle');
const trendingList = document.getElementById('trendingList');
const popularList = document.getElementById('popularList');
const topRatedList = document.getElementById('topRatedList');
const searchList = document.getElementById('searchList');

const trendingLoading = document.getElementById('trendingLoading');
const popularLoading = document.getElementById('popularLoading');
const topRatedLoading = document.getElementById('topRatedLoading');
const searchLoading = document.getElementById('searchLoading');

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('searchResults');

function toggleTheme() {
  const current = document.body.dataset.theme;
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}
themeToggle.addEventListener('click', toggleTheme);

(function loadTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = saved;
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
})();

async function fetchBooks(url, listElem, loader) {
  loader.style.display = 'flex';
  listElem.innerHTML = '';
  try {
    const res = await fetch(url);
    const data = await res.json();
    loader.style.display = 'none';
    const books = data.docs || data.works || [];
    books.slice(0, 15).forEach(b => listElem.appendChild(createBookCard(b)));
  } catch {
    loader.style.display = 'none';
    listElem.innerHTML = '<p>Error loading books.</p>';
  }
}

function loadTrending() {
  fetchBooks('https://openlibrary.org/trending/weekly.json', trendingList, trendingLoading);
}
function loadPopular() {
  fetchBooks('https://openlibrary.org/search.json?sort=edition_count&limit=15', popularList, popularLoading);
}
function loadTopRated() {
  fetchBooks('https://openlibrary.org/search.json?sort=ratings_count&limit=15', topRatedList, topRatedLoading);
}

function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return;
  searchResults.style.display = 'block';
  fetchBooks(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`, searchList, searchLoading);
}

searchBtn.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchBooks();
});

window.addEventListener('load', () => {
  loadTrending();
  loadPopular();
  loadTopRated();
});
