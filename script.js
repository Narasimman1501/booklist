const API = "https://openlibrary.org";
const PLACEHOLDER = "https://via.placeholder.com/180x270?text=No+Cover";

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "🌞";
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "🌙";
  }
}

function createBookCard(book) {
  const div = document.createElement("div");
  div.className = "book-card";
  div.innerHTML = `
    <img src="${book.cover}" alt="${book.title}">
    <h3>${book.title}</h3>
    <p>${book.author}</p>
  `;
  div.addEventListener("click", () => {
    window.location.href = `book.html?id=${book.key}`;
  });
  return div;
}

async function loadBooks(subject, containerId, loaderId) {
  const container = document.getElementById(containerId);
  const loader = document.getElementById(loaderId);
  if (!container) return;
  loader.style.display = "block";
  container.innerHTML = "";

  try {
    const res = await fetch(`${API}/subjects/${subject}.json?limit=10`);
    const data = await res.json();
    loader.style.display = "none";
    data.works.forEach(work => {
      const book = {
        key: work.key,
        title: work.title,
        author: work.authors?.[0]?.name || "Unknown",
        cover: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` : PLACEHOLDER
      };
      container.appendChild(createBookCard(book));
    });
  } catch {
    loader.innerHTML = "⚠️ Failed to load books.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("trending-row")) {
    loadBooks("fantasy", "trending-row", "loading-trending");
    loadBooks("science_fiction", "top-row", "loading-top");
    loadBooks("romance", "popular-row", "loading-popular");
  }

  const genreButtons = document.querySelectorAll(".browse-filters button");
  genreButtons.forEach(btn =>
    btn.addEventListener("click", () => {
      const genre = btn.getAttribute("data-genre");
      loadBooks(genre, "browseResults", null);
    })
  );

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", async () => {
      const q = searchInput.value.trim();
      if (!q) return alert("Enter a search term");
      const res = await fetch(`${API}/search.json?q=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      const grid = document.getElementById("browseResults");
      grid.innerHTML = "";
      data.docs.forEach(doc => {
        const book = {
          key: doc.key,
          title: doc.title,
          author: doc.author_name?.[0] || "Unknown",
          cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : PLACEHOLDER
        };
        grid.appendChild(createBookCard(book));
      });
    });
  }
});
