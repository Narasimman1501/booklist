// Book Class: Represents a Book
class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }
}

// UI Class: Handle UI Tasks
class UI {
  static displayBooks() {
    const books = Store.getBooks();
    books.forEach((book) => UI.addBookToList(book));
  }

  static addBookToList(book) {
    const list = document.querySelector('#book-list');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
    `;
    list.appendChild(row);
  }

  static deleteBook(el) {
    if (el.classList.contains('delete')) {
      el.parentElement.parentElement.remove();
    }
  }

  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector('.container');
    const form = document.querySelector('#book-form');
    container.insertBefore(div, form);

    // Vanish in 3 seconds
    setTimeout(() => document.querySelector('.alert').remove(), 3000);
  }

  static clearFields() {
    document.querySelector('#title').value = '';
    document.querySelector('#author').value = '';
    document.querySelector('#isbn').value = '';
  }

  static displayBookDetails(book) {
    const modal = document.getElementById('bookModal');
    const modalContent = document.getElementById('modalBookDetails');
    
    modalContent.innerHTML = `
      <div class="book-details">
        ${book.cover ? `<img src="${book.cover}" alt="${book.title} cover" class="book-cover mb-3">` : ''}
        <h4>${book.title}</h4>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        ${book.publishDate ? `<p><strong>Published:</strong> ${book.publishDate}</p>` : ''}
        ${book.publisher ? `<p><strong>Publisher:</strong> ${book.publisher}</p>` : ''}
        ${book.pages ? `<p><strong>Pages:</strong> ${book.pages}</p>` : ''}
        ${book.description ? `<p><strong>Description:</strong> ${book.description}</p>` : ''}
      </div>
    `;
    
    modal.style.display = 'block';
  }
}

// Store Class: Handles Storage
class Store {
  static getBooks() {
    let books;
    if (localStorage.getItem('books') === null) {
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem('books'));
    }
    return books;
  }

  static addBook(book) {
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
  }

  static removeBook(isbn) {
    const books = Store.getBooks();
    books.forEach((book, index) => {
      if (book.isbn === isbn) {
        books.splice(index, 1);
      }
    });
    localStorage.setItem('books', JSON.stringify(books));
  }
}

// Open Library API Integration
class OpenLibraryAPI {
  static async searchBooks(query) {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  }

  static async getBookByISBN(isbn) {
    try {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      if (!response.ok) return null;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching book by ISBN:', error);
      return null;
    }
  }

  static displaySearchResults(books) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    if (books.length === 0) {
      resultsDiv.innerHTML = '<p class="text-muted">No books found. Try a different search.</p>';
      return;
    }

    books.forEach(book => {
      const bookCard = document.createElement('div');
      bookCard.className = 'search-result-card';
      
      const coverId = book.cover_i;
      const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';
      
      bookCard.innerHTML = `
        <div class="d-flex">
          ${coverUrl ? `<img src="${coverUrl}" alt="${book.title} cover" class="search-result-cover">` : '<div class="search-result-cover bg-secondary"></div>'}
          <div class="flex-grow-1">
            <h6>${book.title}</h6>
            <p class="mb-1"><small>Author: ${book.author_name ? book.author_name.join(', ') : 'Unknown'}</small></p>
            <p class="mb-1"><small>Year: ${book.first_publish_year || 'N/A'}</small></p>
            <p class="mb-2"><small>ISBN: ${book.isbn ? book.isbn[0] : 'N/A'}</small></p>
            <button class="btn btn-sm btn-primary add-from-search" 
              data-title="${book.title}"
              data-author="${book.author_name ? book.author_name.join(', ') : 'Unknown'}"
              data-isbn="${book.isbn ? book.isbn[0] : 'N/A'}"
              data-cover="${coverUrl}"
              data-year="${book.first_publish_year || ''}"
              data-publisher="${book.publisher ? book.publisher[0] : ''}">
              Add to List
            </button>
          </div>
        </div>
      `;
      
      resultsDiv.appendChild(bookCard);
    });
  }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);

// Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Get form values
  const title = document.querySelector('#title').value;
  const author = document.querySelector('#author').value;
  const isbn = document.querySelector('#isbn').value;

  // Validate
  if (title === '' || author === '' || isbn === '') {
    UI.showAlert('Please fill in all fields', 'danger');
  } else {
    // Instantiate book
    const book = new Book(title, author, isbn);

    // Add Book to UI
    UI.addBookToList(book);

    // Add book to store
    Store.addBook(book);

    // Show success message
    UI.showAlert('Book Added', 'success');

    // Clear fields
    UI.clearFields();
  }
});

// Event: Remove a Book
document.querySelector('#book-list').addEventListener('click', (e) => {
  // Remove book from UI
  UI.deleteBook(e.target);

  // Remove book from store
  Store.removeBook(e.target.parentElement.previousElementSibling.textContent);

  // Show success message
  UI.showAlert('Book Removed', 'success');
});

// Event: Search Books
document.querySelector('#search-btn').addEventListener('click', async () => {
  const query = document.querySelector('#search-input').value;
  
  if (query.trim() === '') {
    UI.showAlert('Please enter a search term', 'warning');
    return;
  }

  const searchBtn = document.querySelector('#search-btn');
  searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
  searchBtn.disabled = true;

  const books = await OpenLibraryAPI.searchBooks(query);
  OpenLibraryAPI.displaySearchResults(books);

  searchBtn.innerHTML = 'Search';
  searchBtn.disabled = false;
});

// Event: Add book from search results
document.getElementById('searchResults').addEventListener('click', (e) => {
  if (e.target.classList.contains('add-from-search')) {
    const title = e.target.dataset.title;
    const author = e.target.dataset.author;
    const isbn = e.target.dataset.isbn;

    // Create book object
    const book = new Book(title, author, isbn);

    // Add Book to UI
    UI.addBookToList(book);

    // Add book to store
    Store.addBook(book);

    // Show success message
    UI.showAlert('Book Added to Your List', 'success');
  }
});

// Event: Close modal
const modal = document.getElementById('bookModal');
const closeBtn = document.getElementsByClassName('close')[0];

if (closeBtn) {
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  }
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// Event: Search on Enter key
document.querySelector('#search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.querySelector('#search-btn').click();
  }
});
