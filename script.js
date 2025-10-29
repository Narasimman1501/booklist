const genres = [
  { name: 'Classic Literature', query: 'classic literature' },
  { name: 'Science Fiction', query: 'science fiction' },
  { name: 'Fantasy', query: 'fantasy' },
  { name: 'Mystery', query: 'mystery' },
  { name: 'Romance', query: 'romance' },
  { name: 'Historical Fiction', query: 'historical fiction' },
];

const genresContainer = document.getElementById('genresContainer');
const searchInput = document.getElementById('searchInput');
const searchResultsSection = document.getElementById('searchResults');
const searchBooksContainer = document.getElementById('searchBooks');

function createBookCard(book) {
  // Book cover URL logic - Open Library covers API
  let coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : 'https://via.placeholder.com/140x210?text=No+Cover';

  // Handle author string (array or empty)
  let author = '';
  if (book.author_name && book.author_name.length > 0) {
    author = book.author_name[0];
  } else if (book.author) {
    author = book.author;
  } else {
    author = 'Unknown Author';
  }

  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <img class="book-cover" src="${coverUrl}" alt="${book.title} cover" loading="lazy" />
    <div class="book-info">
      <div class="book-title" title="${book.title}">${book.title}</div>
      <div class="book-author">${author}</div>
    </div>
  `;

  return card;
}

async function fetchBooksBySubject(subject, limit = 10) {
  try {
    // Using Open Library subjects API for consistent genre results
    const response = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(subject.toLowerCase().replace(/ /g, '_'))}.json?limit=${limit}`);
    if (!response.ok) throw new Error('Network response was not ok');

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
    if (!response.ok) throw new Error('Network response was not ok');

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
    // Emoji based on genre
    let emoji = '📚';
    switch (genre.name.toLowerCase()) {
      case 'classic literature':
        emoji = '🏰';
        break;
      case 'science fiction':
        emoji = '🚀';
        break;
      case 'fantasy':
        emoji = '🐉';
        break;
      case 'mystery':
        emoji = '🕵️‍♂️';
        break;
      case 'romance':
        emoji = '❤️';
        break;
      case 'historical fiction':
        emoji = '🏺';
        break;
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
  }

  // Debounce user input so we don't fire too many requests
  searchTimeout = setTimeout(() => {
    if (query.length > 0) {
      renderSearchResults(query);
    } else {
      searchResultsSection.style.display = 'none';
    }
  }, 400);
});

// Initial load
renderGenres();
