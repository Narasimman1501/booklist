// Get references to DOM elements
const searchInput = document.getElementById('search');
const bookList = document.getElementById('bookList');
const loadingIndicator = document.getElementById('loading');

// Hide loading indicator when page is ready
window.addEventListener('DOMContentLoaded', () => {
  // Simulate a brief loading time to show the loading indicator
  setTimeout(() => {
    loadingIndicator.style.display = 'none';
  }, 500);
});

// Function to search books using Open Library API
async function searchBooks() {
  const query = searchInput.value.trim();
  
  if (!query) {
    bookList.innerHTML = 'Please enter a search term';
    return;
  }
  
  // Show loading message
  bookList.innerHTML = 'Searching...';
  
  try {
    // Fetch data from Open Library API
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();
    
    // Clear previous results
    bookList.innerHTML = '';
    
    if (data.docs && data.docs.length > 0) {
      // Display each book
      data.docs.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        // Get cover image URL
        const coverId = book.cover_i;
        const coverUrl = coverId 
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` 
          : 'https://via.placeholder.com/128x192?text=No+Cover';
        
        // Create book card HTML
        bookCard.innerHTML = `
          <img src="${coverUrl}" alt="${book.title}" />
          <h3>${book.title}</h3>
          <p class="author">Author: ${book.author_name ? book.author_name.join(', ') : 'Unknown'}</p>
          <p class="year">Year: ${book.first_publish_year || 'N/A'}</p>
        `;
        
        bookList.appendChild(bookCard);
      });
    } else {
      bookList.innerHTML = 'No books found. Try a different search.';
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    bookList.innerHTML = 'Error fetching books. Please try again.';
  }
}

// Add event listener for Enter key
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBooks();
  }
});

// Optional: Add event listener for search button if you add one later
// searchButton.addEventListener('click', searchBooks);
