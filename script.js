// script.js

// DOM Elements
const trendingRow = document.getElementById('trending-row');
const topRow = document.getElementById('top-row');
const popularRow = document.getElementById('popular-row');
const searchResults = document.getElementById('searchResults');
const themeToggle = document.getElementById('themeToggle');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');

// Placeholder image
const PLACEHOLDER = 'https://via.placeholder.com/180x270?text=No+Cover';

// Mock data for demonstration
const trendingBooks = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, cover: "" },
  { title: "1984", author: "George Orwell", year: 1949, cover: "" },
  { title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, cover: "" }
];

const topRatedBooks = [
  { title: "Pride and Prejudice", author: "Jane Austen", year: 1813, cover: "" },
  { title: "Moby-Dick", author: "Herman Melville", year: 1851, cover: "" }
];

const popularBooks = [
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", year: 1997, cover: "" },
  { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, cover: "" }
];

// Helper: create a book card
function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';

  const img = document.createElement('img');
  img.src = book.cover || PLACEHOLDER;
  img.alt = book.title;
  img.width = 180;
  img.height = 270;
  card.appendChild(img);

  const title = document.createElement('h3');
  title.textContent = book.title;
  card.appendChild(title);

  const author = document.createElement('p');
  author.className = 'author';
  author.textContent = book.author;
  card.appendChild(author);

  const year = document.createElement('p');
  year.className = 'year';
  year.textContent = book.year;
  card.appendChild(year);

  return card;
}

// Render books into a row
function renderBooks(row, books) {
  row.innerHTML = '';
  books.forEach(book => {
    row.appendChild(createBookCard(book));
  });
}

// Initial load
renderBooks(trendingRow, trendingBooks);
renderBooks(topRow, topRatedBooks);
renderBooks(popularRow, popularBooks);

// Search functionality
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return;
  const allBooks = [...trendingBooks, ...topRatedBooks, ...popularBooks];
  const results = allBooks.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  );
  searchResults.innerHTML = '<h2>Search Results</h2>';
  if (results.length === 0) {
    searchResults.innerHTML += '<p>No books found.</p>';
  } else {
    const row = document.createElement('div');
    row.className = 'book-row';
    renderBooks(row, results);
    searchResults.appendChild(row);
  }
});

// Theme toggle
let darkMode = false;
themeToggle.textContent = '🌙';
themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  themeToggle.textContent = darkMode ? '🌞' : '🌙';
});
