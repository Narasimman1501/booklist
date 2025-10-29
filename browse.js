const genreSelect = document.getElementById('genreSelect');
const genreList = document.getElementById('genreList');
const genreLoading = document.getElementById('genreLoading');
const themeToggle2 = document.getElementById('themeToggle');

themeToggle2.addEventListener('click', () => {
  const current = document.body.dataset.theme;
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  themeToggle2.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

(async function loadTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = saved;
  themeToggle2.textContent = saved === 'dark' ? '☀️' : '🌙';
})();

genreSelect.addEventListener('change', async () => {
  const genre = genreSelect.value;
  if (!genre) return;
  genreLoading.style.display = 'flex';
  genreList.innerHTML = '';
  try {
    const res = await fetch(`https://openlibrary.org/subjects/${genre}.json?limit=20`);
    const data = await res.json();
    genreLoading.style.display = 'none';
    data.works.slice(0, 20).forEach(book => {
      genreList.appendChild(createBookCard(book));
    });
  } catch {
    genreLoading.style.display = 'none';
    genreList.innerHTML = '<p>Failed to load books.</p>';
  }
});
