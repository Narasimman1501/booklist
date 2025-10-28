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
  img.onerror = () => {
    img.src = 'https://via.placeholder.com/180x270?text=No+Cover';
  };
  card.appendChild(img);

  const title = document.createElement('h3');
  title.textContent = book.title;
  card.appendChild(title);

  const author = document.createElement('p');
  author.className = 'author';
  author.textContent = book.author_name ? book.author_name[0] : 'Unknown';
  card.appendChild(author);

  const year = document.createElement('p');
  year.className = 'year
