const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const listContainer = document.getElementById('bookList');
const loading = document.getElementById('loading');

async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return alert("Please enter a book title!");

  // Show loading spinner
  loading.style.display = "flex";
  listContainer.innerHTML = "";

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    // Hide loading spinner
    loading.style.display = "none";

    if (!data.docs || data.docs.length === 0) {
      listContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    listContainer.innerHTML = "";

    data.docs.slice(0, 10).forEach(book => {
      const title = book.title || "Unknown Title";
      const author = book.author_name ? book.author_name.join(', ') : "Unknown Author";
      const year = book.first_publish_year || "N/A";
      const coverId = book.cover_i;
      const coverUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : "https://via.placeholder.com/128x193?text=No+Cover";

      const div = document.createElement('div');
      div.className = 'book-card';
      div.innerHTML = `
        <img src="${coverUrl}" alt="${title}">
        <h3>${title}</h3>
        <p class="author">${author}</p>
        <p class="year">First published: ${year}</p>
      `;
      listContainer.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    loading.style.display = "none";
    listContainer.innerHTML = "<p>Something went wrong while fetching data.</p>";
  }
}

searchBtn.addEventListener('click', searchBooks);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBooks();
});
