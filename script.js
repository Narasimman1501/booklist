// ===== Fetch Books from Open Library Subjects =====
async function fetchBooks(subject, containerId) {
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=12`;
  const response = await fetch(url);
  const data = await response.json();
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  data.works.forEach(book => {
    const title = book.title;
    const author = book.authors?.[0]?.name || "Unknown";
    const cover = book.cover_id
      ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
      : `https://via.placeholder.com/150x230?text=No+Cover`;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${cover}" alt="${title}">
      <h4>${title}</h4>
      <p>${author}</p>
      <button>❤️ Save</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      addToMyList({ title, author, cover });
    });
    container.appendChild(card);
  });
}

// Load example subjects
fetchBooks("science_fiction", "trending-books");
fetchBooks("classics", "classic-books");

// ===== Search Feature (Anilist-style dynamic list) =====
const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.trim();
    if (!query) return;
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
    const data = await res.json();
    const container = document.getElementById("trending-books");
    container.innerHTML = `<h3>Search results for "${query}"</h3>`;

    data.docs.forEach(book => {
      const cover = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : `https://via.placeholder.com/150x230?text=No+Cover`;
      const title = book.title || "Untitled";
      const author = book.author_name ? book.author_name[0] : "Unknown";

      const card = document.createElement("div");
      card.className = "book-card";
      card.innerHTML = `
        <img src="${cover}" alt="${title}">
        <h4>${title}</h4>
        <p>${author}</p>
        <button>❤️ Save</button>
      `;
      card.querySelector("button").addEventListener("click", () => {
        addToMyList({ title, author, cover });
      });
      container.appendChild(card);
    });
  }
});

// ===== My List (localStorage) =====
function addToMyList(book) {
  let myList = JSON.parse(localStorage.getItem("myList")) || [];
  if (!myList.some(b => b.title === book.title)) {
    myList.push(book);
    localStorage.setItem("myList", JSON.stringify(myList));
    alert(`Added "${book.title}" to My List ❤️`);
  } else {
    alert(`"${book.title}" is already saved.`);
  }
}

function loadMyList() {
  const saved = JSON.parse(localStorage.getItem("myList")) || [];
  const container = document.getElementById("my-list-container");
  container.innerHTML = "";

  if (saved.length === 0) {
    container.innerHTML = "<p>Your list is empty.</p>";
    return;
  }

  saved.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <h4>${book.title}</h4>
      <p>${book.author}</p>
      <button class="remove-btn" data-title="${book.title}">Remove</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const title = e.target.dataset.title;
      removeFromMyList(title);
      loadMyList();
    });
  });
}

function removeFromMyList(title) {
  let myList = JSON.parse(localStorage.getItem("myList")) || [];
  myList = myList.filter(b => b.title !== title);
  localStorage.setItem("myList", JSON.stringify(myList));
}

// ===== Modal Controls =====
const modal = document.getElementById("myListModal");
const openBtn = document.getElementById("my-list-btn");
const closeBtn = document.querySelector(".close");

openBtn.onclick = () => {
  loadMyList();
  modal.style.display = "block";
};

closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};
