const trendingRow = document.getElementById('trending-row');
const topRow = document.getElementById('top-row');
const popularRow = document.getElementById('popular-row');
const browseRow = document.getElementById('browse-row');
const searchResults = document.getElementById('searchResults');

const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '🌙' : '🌞';
});

// Create uniform book card with fallback image
const createBookCard = (book) => {
  const card = document.createElement('div');
  card.className = 'book-card';

  const img = document.createElement('img');
  img.src = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : 'https://via.placeholder.com/180x270?text=No+Cover';
  img.alt = book.title;
  img.onerror = () => { img.src = 'https://via.placeholder.com/180x270?text=No+Cover'; };
  card.appendChild(img);

  const title = document.createElement('h3');
  title.textContent = book.title;
  card.appendChild(title);

  const author = document.createElement('p');
  author.className = 'author';
  author.textContent = book.author_name ? book.author_name[0] : 'Unknown';
  card.appendChild(author);

  const year = document.createElement('p');
  year.className = 'year';
  year.textContent = book.first_publish_year || '';
  card.appendChild(year);

  return card;
};

// Fetch books from Open Library API
const fetchBooks = async (query, row) => {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=10`);
    const data = await res.json();
    row.innerHTML = '';
    data.docs.forEach(book => row.appendChild(createBookCard(book)));
  } catch (err) {
    console.error(err);
    row.innerHTML = '<p>Failed to load books.</p>';
  }
};

// Initial load
fetchBooks('trending', trendingRow);
fetchBooks('top rated', topRow);
fetchBooks('popular', popularRow);

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('search').value.trim();
  if (!query) return;
  searchResults.innerHTML = '<h2>Search Results</h2>';
  const resultRow = document.createElement('div');
  resultRow.className = 'book-row';
  searchResults.appendChild(resultRow);
  fetchBooks(query, resultRow);
});

// Browse by genre
document.querySelectorAll('#genre-filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#genre-filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const genre = btn.getAttribute('data-genre');
    fetchBooks(genre, browseRow);
  });
});
