// script.js

// Elements
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

// Theme toggle
themeToggle.addEventListener('click', function () {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    themeToggle.textContent = '🌙';
  } else {
    themeToggle.textContent = '🌞';
  }
});

// Helper: create book card
function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';

  const img = document.createElement('img');
  img.src = book.cover_i
    ? 'https://covers.openlibrary.org/b/id/' + book.cover_i + '-M.jpg'
    : 'https://via.placeholder.com/180x270?text=No+Cover';
  img.alt = book.title;
  img.style.width = '180px';
  img.style.height = '270px';
  img.style.objectFit = 'cover';

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

// Load section books
function loadSection(url, container, loadingElement) {
  loadingElement.style.display = 'flex';
  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      loadingElement.style.display = 'none';
      container.innerHTML = '';
      const books = data.docs.slice(0, 10); // limit 10 books
      books.forEach(function (book) {
        const card = createBookCard(book);
        container.appendChild(card);
      });
    })
    .catch(function (err) {
      loadingElement.style.display = 'none';
      container.innerHTML = '<p>Failed to load books.</p>';
      console.error(err);
    });
}

// Search books
function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchResults.innerHTML = '<p>Searching...</p>';
  fetch('https://openlibrary.org/search.json?q=' + encodeURIComponent(query))
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      searchResults.innerHTML = '';
      const books = data.docs.slice(0, 10);
      if (books.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        return;
      }
      books.forEach(function (book) {
        const card = createBookCard(book);
        searchResults.appendChild(card);
      });
    })
    .catch(function (err) {
      searchResults.innerHTML = '<p>Search failed.</p>';
      console.error(err);
    });
}

// Event listeners
searchBtn.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') searchBooks();
});

// Load all sections initially
loadSection(
  'https://openlibrary.org/search.json?q=trending',
  trendingRow,
  loadingTrending
);
loadSection(
  'https://openlibrary.org/search.json?q=top+rated',
  topRow,
  loadingTop
);
loadSection(
  'https://openlibrary.org/search.json?q=popular',
  popularRow,
  loadingPopular
);

// Browse by genre
const genreButtons = document.querySelectorAll('#genre-filters button');
genreButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    genreButtons.forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    const genre = btn.getAttribute('data-genre');
    loadSection(
      'https://openlibrary.org/search.json?subject=' + genre,
      browseRow,
      loadingBrowse
    );
  });
});
