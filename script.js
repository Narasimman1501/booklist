const genres = [
  { name: 'Classic Literature', query: 'classic_literature' },
  { name: 'Science Fiction', query: 'science_fiction' },
  { name: 'Fantasy', query: 'fantasy' },
  { name: 'Mystery', query: 'mystery' },
  { name: 'Romance', query: 'romance' },
  { name: 'Historical Fiction', query: 'historical_fiction' },
];

const genresContainer = document.getElementById('genresContainer');
const searchInput = document.getElementById('searchInput');
const searchResultsSection = document.getElementById('searchResults');
const searchBooksContainer = document.getElementById('searchBooks');

function createBookCard(book) {
  // Handle cover URL - fallback to placeholder if no cover_i
  const coverUrl = book.cover_id
    ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
    : (book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : 'https://via.placeholder.com/140x210?text=No+Cover');

  // Authors can be in different fields depending on API endpoint
  let author = 'Unknown Author';
  if (book.authors && Array.isArray(book.authors) && book.authors.length > 0) {
    author = book.authors[0].name || author;
  } else if (book.author_name && Array.isArray(book.author_name) && book.author_name.length > 0) {
    author = book.author_name[0];
  } else if (book.author) {
    author = book.author;
  }

  const title = book.title || 'Untitled';

  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <img class="book-cover" src="${coverUrl}" alt="${title} cover" loading="lazy" />
    <div class="book-info">
      <div class="book-title" title="${title}">${title}</div>
      <div class="book-author">${author}</div>
    </div>
  `;

  return card;
}

async function fetchBooksBySubject(subject, limit = 10) {
  try {
    // Subjects endpoint expects lowercase and underscores (like classic_literature)
    const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=${limit}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const data = await response.json();
    return data.works || [];
  } catch (error) {
    console.error(`Failed to fetch books for subject "${subject}":`, error);
    return [];
  }
}

async function fetchBooksBySearch(query, limit = 20) {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error(`Failed to fetch books for search "${query}":`, error);
    return [];
  }
}

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

async function renderGenres() {
  clearContainer(genresContainer);

  for (const genre of genres) {
    const section = document.createElement('section');
    section.className = 'book-section';

    const heading = document.createElement('h2');

    // Emoji for genres
    let emoji = '📚';
    switch (genre.name.toLowerCase()) {
      case 'classic literature': emoji = '🏰'; break;
      case 'science fiction': emoji = '🚀'; break;
      case 'fantasy': emoji = '🐉'; break;
      case 'mystery': emoji = '🕵️‍♂️'; break;
      case 'romance': emoji = '❤️'; break;
      case 'historical fiction': emoji = '🏺'; break;
    }

    heading.textContent = `${emoji} ${genre.name}`;
    section.appendChild(heading);

    const booksRow = document.createElement('div');
    booksRow.className = 'books-row';
    section.appendChild(booksRow);

    genresContainer.appendChild(section);

    const books = await fetchBooksBySubject(genre.query, 10);

    if (books.length === 0) {
      booksRow.textContent = 'No books found for this genre.';
      continue;
    }

    for (const book of books) {
      const card = createBookCard(book);
      booksRow.appendChild(card);
    }
  }
}

async function renderSearchResults(query) {
  if (!query.trim()) {
    searchResultsSection.style.display = 'none';
    return;
  }
  searchResultsSection.style.display = 'block';
  clearContainer(searchBooksContainer);

  const results = await fetchBooksBySearch(query, 20);
  if (results.length === 0) {
    searchBooksContainer.textContent = 'No results found.';
    return;
  }

  for (const book of results) {
    const card = createBookCard(book);
    searchBooksContainer.appendChild(card);
  }
}

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();

  if (query === '') {
    searchResultsSection.style.display = 'none';
    return;
  }

  // Debounce search by 400ms
  searchTimeout = setTimeout(() => {
    renderSearchResults(query);
  }, 400);
});

// Initial rendering
renderGenres();
