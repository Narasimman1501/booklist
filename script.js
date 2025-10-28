const themeBtn = document.getElementById('themeToggle');
themeBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '🌞';
});

let myList = JSON.parse(localStorage.getItem('myList')) || [];

async function fetchBooks(subject='bestsellers', limit=10) {
  try {
    const res = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=${limit}`);
    const data = await res.json();
    return data.works || [];
  } catch(err) {
    console.error(err);
    return [];
  }
}

function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <img src="${book.cover_id ? 'https://covers.openlibrary.org/b/id/' + book.cover_id + '-L.jpg' : 'https://via.placeholder.com/180x270?text=No+Cover'}" alt="${book.title}">
    <div class="book-info">
      <h3>${book.title}</h3>
      <p>${book.authors?.[0]?.name || 'Unknown'}</p>
      <button class="add-mylist-btn">Add to My List</button>
    </div>
  `;
  // Link to Open Library
  card.querySelector('img').addEventListener('click', e => {
    e.stopPropagation();
    window.open('https://openlibrary.org' + book.key, '_blank');
  });

  // Add to My List
  card.querySelector('.add-mylist-btn').addEventListener('click', e => {
    e.stopPropagation();
    if(!myList.find(b => b.key === book.key)){
      myList.push({key: book.key, title: book.title, status:'planning'});
      localStorage.setItem('myList', JSON.stringify(myList));
      alert(`${book.title} added to My List`);
    }
  });

  return card;
}

// Render section
async function renderSection(rowId, subject){
  const row = document.getElementById(rowId);
  if(!row) return;
  row.innerHTML = '';
  const books = await fetchBooks(subject, 10);
  books.forEach(book => row.appendChild(createBookCard(book)));
}

// Home page sections
renderSection('trending-row','bestsellers');
renderSection('top-row','popular');
renderSection('popular-row','fiction');

// Browse page
if(document.getElementById('browse-row')){
  const genreButtons = document.querySelectorAll('#genre-filters button');
  genreButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = document.getElementById('browse-row');
      row.innerHTML = '';
      const books = await fetchBooks(btn.dataset.genre,20);
      books.forEach(book => row.appendChild(createBookCard(book)));
    });
  });
}
