const genres = [
  { name: 'Classic Literature', query: 'classic_literature', emoji: '🏰' },
  { name: 'Science Fiction', query: 'science_fiction', emoji: '🚀' },
  { name: 'Fantasy', query: 'fantasy', emoji: '🐉' },
  { name: 'Mystery', query: 'mystery', emoji: '🕵️‍♂️' },
  { name: 'Romance', query: 'romance', emoji: '❤️' },
  { name: 'Historical Fiction', query: 'historical_fiction', emoji: '🏺' },
];

const specialRows = [
  { name: 'Trending', endpoint: 'https://openlibrary.org/trending/daily.json', emoji: '📈' },
  { name: 'Top Rated', query: '*', sort: 'edition_count desc', emoji: '⭐' },
  { name: 'Popular', query: '*', sort: 'edition_count desc', emoji: '🔥' },
];

const genresContainer = document.getElementById('genresContainer');
const searchInput = document.getElementById('searchInput');
const searchResultsSection = document.getElementById('searchResults');
const searchBooksContainer = document.getElementById('searchBooks');

function createBookCard(book) {
  const coverId = book.cover_id || book.cover_i || null;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : 'https://via.placeholder.com/140x210?text=No+Cover';

  let author = 'Unknown Author';
  if (book.author_name && book.author_name.length > 0) {
    author = book.author_name[0];
  } else if (book.authors && book.authors.length > 0 && book.authors[0].name) {
    author = book.authors[0].name;
  }

  const title = book.title || 'Untitled';

  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <img class="book-cover" src="${coverUrl}" alt="${title} cover" loading="lazy" />
    <div class="book-info">
      <div class="book-title">${title}</div>
      <div class="book-author">${author}</div>
    </div>
  `;
  return card;
}

async function fetchTrendingBooks(limit = 12) {
  try {
    const res = await fetch(`${specialRows[0].endpoint}?limit=${limit}`);
    if (!res.ok) throw new Error(`Trending fetch failed: ${res.status}`);
    const data = await res.json();
    return data.works || [];
  } catch (err) {
    console.error('Error fetching trending:', err);
    return [];
  }
}

async function fetchBooksBySearch(query, sort = null, limit = 12) {
  try {
    let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,cover_i,edition_count`;
    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Search fetch failed: ${res.status}`);
    const data = await res.json();
    return data.docs || [];
  } catch (err) {
    console.error('Error in search fetch:', err);
    return [];
  }
}

async function renderSpecialRows() {
  for (const row of specialRows) {
    const section = document.createElement('section');
    section.className = 'book-section';
    const heading = document.createElement('h2');
    heading.textContent = `${row.emoji} ${row.name}`;
    section.appendChild(heading);
    const booksRow = document.createElement('div');
    booksRow.className = 'books-row';
    section.appendChild(booksRow);
    genresContainer.parentNode.insertBefore(section, genresContainer);

    let books = [];
    if (row.endpoint) {
      books = await fetchTrendingBooks(12);
    } else {
      books = await fetchBooksBySearch(row.query, row.sort, 12);
    }

    if (books.length === 0) {
      booksRow.textContent = 'No books found.';
    } else {
      books.forEach(b => booksRow.appendChild(createBookCard(b)));
    }
  }
}

async function renderGenres() {
  genresContainer.innerHTML = '';
  searchResultsSection.classList.add('hidden');
  genresContainer.style.display = 'block';

  for (const genre of genres) {
    const section = document.createElement('section');
    section.className = 'book-section';
    const heading = document.createElement('h2');
    heading.textContent = `${genre.emoji} ${genre.name}`;
    section.appendChild(heading);
    const booksRow = document.createElement('div');
    booksRow.className = 'books-row';
    section.appendChild(booksRow);
    genresContainer.appendChild(section);

    const books = await fetchBooksBySearch(genre.query, null, 12);
    if (books.length === 0) {
      booksRow.textContent = 'No books found.';
    } else {
      books.forEach(b => booksRow.appendChild(createBookCard(b)));
    }
  }
}

async function renderSearchResults(query) {
  if (!query.trim()) {
    searchResultsSection.classList.add('hidden');
    genresContainer.style.display = 'block';
    return;
  }
  genresContainer.style.display = 'none';
  searchResultsSection.classList.remove('hidden');
  searchBooksContainer.innerHTML = '';

  const books = await fetchBooksBySearch(query, null, 20);
  if (books.length === 0) {
    searchBooksContainer.textContent = 'No results found.';
  } else {
    books.forEach(b => searchBooksContainer.appendChild(createBookCard(b)));
  }
}

let debounceTimeout;
searchInput.addEventListener('input', e => {
  clearTimeout(debounceTimeout);
  const query = e.target.value;
  debounceTimeout = setTimeout(() => renderSearchResults(query), 300);
});

// Initial load
renderSpecialRows().then(() => renderGenres());
