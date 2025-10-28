const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '🌞';
});

// Dummy my list
let myList = JSON.parse(localStorage.getItem('myList')) || [];

// Fetch books from Open Library API
async function fetchBooks(subject = 'bestsellers', limit = 10) {
  const res = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=${limit}`);
  const data = await res.json();
  return data.works || [];
}

// Create book card
function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <img src="${book.cover_id ? 'https://covers.openlibrary.org/b/id/' + book.cover_id + '-L.jpg' : 'https://via.placeholder.com/180x270?text=No+Cover'}" alt="${book.title}">
    <h3>${book.title}</h3>
    <p class="author">${book.authors?.[0]?.name || 'Unknown'}</p>
    <p class="year">${book.first_publish_year || ''}</p>
    <button onclick="addToList('${book.key}','${book.title}')">Add to My List</button>
  `;
  card.onclick = () => window.location.href = 'https://openlibrary.org' + book.key;
  return card;
}

// Add to My List
function addToList(key, title) {
  if (!myList.find(b => b.key === key)) {
    myList.push({ key, title, status: 'planning' });
    localStorage.setItem('myList', JSON.stringify(myList));
    alert(`${title} added to My List!`);
  }
}

// Render section
async function renderSection(rowId, subject) {
  const row = document.getElementById(rowId);
  const books = await fetchBooks(subject, 10);
  books.forEach(book => row.appendChild(createBookCard(book)));
}

// Render home sections
if (document.getElementById('trending-row')) renderSection('trending-row', 'bestsellers');
if (document.getElementById('top-row')) renderSection('top-row', 'popular');
if (document.getElementById('popular-row')) renderSection('popular-row', 'fiction');

// Render Browse
if (document.getElementById('browse-row')) {
  const genreButtons = document.querySelectorAll('#genre-filters button');
  genreButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = document.getElementById('browse-row');
      row.innerHTML = '';
      const books = await fetchBooks(btn.dataset.genre, 20);
      books.forEach(book => row.appendChild(createBookCard(book)));
    });
  });
}

// Render My
