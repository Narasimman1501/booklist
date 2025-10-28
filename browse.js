const API_URL = "https://openlibrary.org";
const PLACEHOLDER = "https://dummyimage.com/200x300/cccccc/000000&text=No+Cover";

// DOM elements
const searchInput = document.getElementById("browseSearch");
const genreFilter = document.getElementById("genreFilter");
const yearFilter = document.getElementById("yearFilter");
const sortFilter = document.getElementById("sortFilter");
const browseGrid = document.getElementById("browseGrid");
const loading = document.getElementById("browseLoading");
const themeToggle = document.getElementById("themeToggle");

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  themeToggle.textContent = dark ? "🌞" : "🌙";
  localStorage.setItem("theme", dark ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "🌞";
}

// Fetch and render books
async function loadBooks(query = "popular") {
  browseGrid.innerHTML = "";
  loading.style.display = "flex";

  try {
    const res = await fetch(`${API_URL}/search.json?q=${encodeURIComponent(query)}&limit=24`);
    const data = await res.json();
    renderBooks(data.docs);
  } catch (err) {
    console.error(err);
    browseGrid.innerHTML = "<p>Failed to load books.</p>";
  } finally {
    loading.style.display = "none";
  }
}

// Render book grid
function renderBooks(books) {
  browseGrid.innerHTML = books
    .filter(b => b.title)
    .map(book => {
      const cover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : PLACEHOLDER;
      const year = book.first_publish_year || "Unknown";
      const author = book.author_name ? book.author_name[0] : "Unknown";

      return `
      <div class="book-card" onclick="openBook('${book.key}')">
        <img src="${cover}" alt="${book.title}">
        <div class="book-overlay">
          <h3>${book.title}</h3>
          <p>${author} • ${year}</p>
        </div>
      </div>`;
    })
    .join("");
}

// Open book detail page
function openBook(key) {
  window.location.href = `book.html?id=${encodeURIComponent(key)}`;
}

// Filters
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  if (q.length > 2) loadBooks(q);
});

genreFilter.addEventListener("change", () => {
  const genre = genreFilter.value;
  if (genre) loadBooks(`subject:${genre}`);
});

sortFilter.addEventListener("change", () => {
  const sort = sortFilter.value;
  const cards = Array.from(browseGrid.children);
  cards.sort((a, b) => {
    const titleA = a.querySelector("h3").textContent.toLowerCase();
    const titleB = b.querySelector("h3").textContent.toLowerCase();
    if (sort === "title") return titleA.localeCompare(titleB);
    const yearA = parseInt(a.querySelector("p").textContent.split("•")[1]) || 0;
    const yearB = parseInt(b.querySelector("p").textContent.split("•")[1]) || 0;
    return sort === "year" ? yearB - yearA : 0;
  });
  browseGrid.innerHTML = "";
  cards.forEach(c => browseGrid.appendChild(c));
});

// Initial load
loadBooks("popular books");
