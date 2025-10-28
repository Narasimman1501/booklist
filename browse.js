const API_URL = "https://openlibrary.org";
const PLACEHOLDER = "https://dummyimage.com/200x300/cccccc/000000&text=No+Cover";

const searchInput = document.getElementById("browseSearch");
const genreFilter = document.getElementById("genreFilter");
const sortFilter = document.getElementById("sortFilter");
const browseGrid = document.getElementById("browseGrid");
const loading = document.getElementById("browseLoading");

let currentBooks = [];

// Fetch books from Open Library
async function loadBooks(query = "books") {
  browseGrid.innerHTML = "";
  loading.style.display = "flex";
  try {
    const res = await fetch(`${API_URL}/search.json?q=${encodeURIComponent(query)}&limit=50`);
    const data = await res.json();
    currentBooks = data.docs.filter(b => b.title);
    renderBooks(currentBooks);
  } catch (err) {
    console.error(err);
    browseGrid.innerHTML = "<p>Failed to load books.</p>";
  } finally {
    loading.style.display = "none";
  }
}

// Render books
function renderBooks(books) {
  browseGrid.innerHTML = books.map(book => {
    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : PLACEHOLDER;
    const title = book.title || "Untitled";
    const author = book.author_name ? book.author_name[0] : "Unknown";
    const year = book.first_publish_year || "—";
    return `
      <div class="book-card" onclick="openBook('${book.key}')">
        <img src="${cover}" alt="${title}">
        <div class="book-overlay">
          <h3>${title}</h3>
          <p>${author} • ${year}</p>
        </div>
      </div>
    `;
  }).join("");
}

// Open individual book page
function openBook(key) {
  window.location.href = `book.html?id=${encodeURIComponent(key)}`;
}

// Filter by genre
genreFilter.addEventListener("change", () => {
  const genre = genreFilter.value;
  if (genre) loadBooks(`subject:${genre}`);
  else loadBooks("books");
});

// Search functionality
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  if (q.length > 2) loadBooks(q);
});

// Sorting logic
sortFilter.addEventListener("change", () => {
  let sorted = [...currentBooks];
  const sortType = sortFilter.value;

  switch (sortType) {
    case "az":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "za":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "trending":
      sorted.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
      break;
    case "popular":
      sorted.sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0));
      break;
    case "top":
      sorted.sort((a, b) => (b.ratings_average || 0) - (a.ratings_average || 0));
      break;
    default:
      sorted = currentBooks;
  }
  renderBooks(sorted);
});

// Initial Load
loadBooks("popular books");
