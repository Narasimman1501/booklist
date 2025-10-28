const PLACEHOLDER = "https://via.placeholder.com/180x270?text=No+Cover";

const trendingRow = document.getElementById("trending-row");
const topRow = document.getElementById("top-row");
const popularRow = document.getElementById("popular-row");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");

const API_URL = "https://openlibrary.org";

// Helper to create book card
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const img = document.createElement("img");
  img.src = book.cover || PLACEHOLDER;
  img.alt = book.title;

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.className = "author";
  author.textContent = book.author || "Unknown Author";

  const year = document.createElement("p");
  year.className = "year";
  year.textContent = book.year || "";

  card.append(img, title, author, year);
  return card;
}

// Fetch trending books (example: search for popular subjects)
async function loadBooks(subject, container) {
  try {
    const res = await fetch(`${API_URL}/subjects/${subject}.json?limit=10`);
    const data = await res.json();
    container.innerHTML = "";
    data.works.forEach(work => {
      const book = {
        title: work.title || "No Title",
        author: work.authors && work.authors[0] ? work.authors[0].name : "Unknown Author",
        cover: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` : PLACEHOLDER,
        year: work.first_publish_year || ""
      };
      container.appendChild(createBookCard(book));
    });
  } catch (err) {
    container.innerHTML = `<p>Failed to load books.</p>`;
    console.error(err);
  }
