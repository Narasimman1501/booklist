const genres = [
  { name: 'Classic Literature', query: 'classic_literature', emoji: '🏰' },
  { name: 'Science Fiction', query: 'science_fiction', emoji: '🚀' },
  { name: 'Fantasy', query: 'fantasy', emoji: '🐉' },
  { name: 'Mystery', query: 'mystery', emoji: '🕵️‍♂️' },
  { name: 'Romance', query: 'romance', emoji: '❤️' },
  { name: 'Historical Fiction', query: 'historical_fiction', emoji: '🏺' },
];

const genresContainer = document.getElementById('genresContainer');
const searchInput = document.getElementById('searchInput');
const searchResultsSection = document.getElementById('searchResults');
const searchBooksContainer = document.getElementById('searchBooks');

function createBookCard(book) {
  // OpenLibrary covers come from different fields
  const coverId = book.cover_id || book.cover_i || (book.cover && book.cover.medium) || null;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : 'https://via.placeholder.com/140x210/333/777?text=No+Cover';

  let author = 'Unknown Author';
  if (book.authors && book.authors.length > 0 && book.authors[0].name) {
    author = book.authors[0].name;
  } else if (book.author_name && book.author_name.length > 0) {
    author = book.author_name[0];
  } else if (book.author) {
    author = book.author;
  }

  const title = book.title || 'Untitled';

  const card = document.createElement('div');
  card.className = 'book-card';
  card.title = `${title} by ${author}`;

  card.innerHTML = `
    <img class="book-cover" src="${coverUrl}" alt="${title} cover" loading="lazy" />
    <div class="book-info">
      <div class="book-title">${title}</div>
      <div class="book-author">${author}</div>
    </div>
  `;

  return card;
}

async function fetchBooksBySubject(subject, limit = 12) {
  try {
    const res = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch subject ${subject}: ${res.status}`);

    const data = await res.json();
    return data.works || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchBooksBySearch(query, limit = 24) {
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to search: ${res.status}`);

    const data = await res.json();
    return data.docs || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

function clearContainer(container) {
  container.innerHTML = '';
}

async function renderGenres() {
  clearContainer(genresContainer);
  searchResultsSection.classList.add('hidden');

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

    const books = await fetchBooksBySubject(genre.query, 12);
    if (!books.length) {
      booksRow.textContent = 'No books found.';
      continue;
    }

    books.forEach(book => {
      const card = createBookCard(book);
      booksRow.appendChild(card);
    });
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
  clearContainer(searchBooksContainer);

  const books = await fetchBooksBySearch(query, 24);

  if (!books.length) {
    searchBooksContainer.textContent = 'No results found.';
    return;
  }

  books.forEach(book => {
    const card = createBookCard(book);
    searchBooksContainer.appendChild(card);
  });
}

let debounceTimeout;
searchInput.addEventListener('input', e => {
  clearTimeout(debounceTimeout);

  const query = e.target.value;
  debounceTimeout = setTimeout(() => {
    renderSearchResults(query);
  }, 400);
});

// Initial load
renderGenres();
