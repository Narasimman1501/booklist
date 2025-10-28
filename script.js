const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const listContainer = document.getElementById('bookList');
const loading = document.getElementById('loading');

// Show loading spinner
function showLoading() {
  loading.classList.add('show');
  listContainer.innerHTML = "";
}

// Hide loading spinner
function hideLoading() {
  loading.classList.remove('show');
}

// Create book card
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
    <p class="year">First published: ${year}</p>
  `;
  listContainer.appendChild(div);
}

// Search books
async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a book title!");

  showLoading();

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    hideLoading();

    if (!data.docs || data.docs.length === 0) {
      listContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    data.docs.slice(0, 10).forEach(book => createBookCard(book));

  } catch (err) {
    console.error(err);
    hideLoading();
    listContainer.innerHTML = "<p>Something went wrong while fetching data.</p>";
  }
}

// Search button click
searchBtn.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBooks(); });

// Load trending / popular / top-rated books on page load
async function loadTrendingBooks() {
  const trending = ["Harry Potter", "The Hobbit", "To Kill a Mockingbird", "1984", "The Lord of the Rings"];
  showLoading();

  for (let title of trending) {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`);
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        data.docs.slice(0, 2).forEach(book => createBookCard(book)); // 2 books per trending title
      }
    } catch (err) {
      console.error(err);
    }
  }

  hideLoading();
}

// Run on page load
window.addEventListener('load', loadTrendingBooks);
