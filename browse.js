const genreSelect = document.getElementById('genreSelect');
const genreList = document.getElementById('genreList');
const genreLoading = document.getElementById('genreLoading');
const browseSearch = document.getElementById('browseSearch');
const browseSearchBtn = document.getElementById('browseSearchBtn');
const themeToggle2 = document.getElementById('themeToggle');

// Theme
function toggleTheme() {
  const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  themeToggle2.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}
themeToggle2.addEventListener('click', toggleTheme);
(function loadTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = saved;
  themeToggle2.textContent = saved === 'dark' ? '☀️' : '🌙';
})();

async function fetchBooks(url) {
  genreLoading.style.display = 'flex';
  genreList.innerHTML = '';
  try {
    const res = await fetch(url);
    const data = await res.json();
    genreLoading.style.display = 'none';
    const works = data.works || data.docs || [];
    if (works.length === 0) {
      genreList.innerHTML = "<p>No books found.</p>";
      return;
    }
    works.slice(0, 20).forEach(book => genreList.appendChild(createBookCard(book)));
  } catch {
    genreLoading.style.display = 'none';
    genreList.innerHTML = "<p>Failed to load books.</p>";
  }
}

genreSelect.addEventListener('change', () => {
  const genre = genreSelect.value;
  if (!genre) return;
  fetchBooks(`https://openlibrary.org/subjects/${genre}.json?limit=20`);
});

browseSearchBtn.addEventListener('click', () => {
  const q = browseSearch.value.trim();
  if (!q) return;
  fetchBooks(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`);
});
browseSearch.addEventListener('keypress', e => {
  if (e.key === 'Enter') browseSearchBtn.click();
});
