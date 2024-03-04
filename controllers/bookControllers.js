// Importing necessary modules
const Book = require('../models/bookModel');
const mongoose = require('mongoose');

// Function to retrieve all books
const getBooks = async (req, res ) => {
    // Retrieve all books, excluding certain fields, and sort by createdAt in descending order
    const books = await Book.find({}).select('-createdAt -updatedAt -__v').sort({ createdAt: -1 });

    // Check if there are no books
    if (!books) {
        return res.status(200).json({message: 'No existing books'});
    }

    // Return the list of books
    return res.status(200).json(books);
};

// Function to retrieve a specific book by ID
const getSpecificBook = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the provided ID is a valid mongoose ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid book ID" });
        }

        // Find the specific book by its ID
        const book = await Book.findById(id);

        // Check if the book is not found
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }

        // Return the specific book
        return res.status(200).json(book);
    } catch (error) {
        // Handle any errors and send an error response
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

const searchBooks = async (req, res) => {
    try {
        const { title, author, genre } = req.body;

        const searchCriteria = {};

        if (title) searchCriteria.title = new RegExp(title, 'i');
        if (author) searchCriteria.author = new RegExp(author, 'i');
        if (genre) searchCriteria.genre = new RegExp(genre, 'i');

        const books = await Book.find(searchCriteria).select('-createdAt -updatedAt -__v').sort({ createdAt: -1 });

        if (!books || books.length === 0) {
            return res.status(200).json({ message: 'No matching books found' });
        }

        return res.status(200).json(books);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

// Function to create a new book
const createBook = async (req, res) => {
    try {
        const { title, author, genre, stocks } = req.body;

        // Get the logged-in user
        const user = req.user;

        // Check if the logged-in user is an admin
        if ( user.isAdmin == true ) {
            // Check if the book already exists
            const bookExist = await Book.findOne({ title: title });

            // If the book already exists, return an error response
            if (bookExist) {
                return res.status(409).json({ error: 'Book Already Exists' });
            }

            // Create a new book
            const book = await Book.create({
                title: title,
                author: author,
                genre: genre,
                stocks: stocks
            });

            // If the book is created successfully, return its details
            if (book) {
                return res.status(201).json({
                   _id: book._id,
                   title: book.title,
                   author: book.author,
                   genre: book.genre,
                   stocks: book.stocks
                });
            } else {
                return res.status(400).json({message: "Invalid Book"});
            }
        } else {
            // Return an unauthorized response if the user is not an admin
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        // Handle any errors and send an error response
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

// Function to update a book
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, genre, stocks } = req.body;

        // Get the logged-in user
        const user = req.user;

        // Check if the logged-in user is an admin
        if (user.isAdmin) {
            // Check if the provided ID is a valid mongoose ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid book ID" });
            }

            // Find and update the book
            const updatedBook = await Book.findOneAndUpdate(
                { _id: id },
                { title, author, genre, stocks },
                { new: true }
            );

            // If the book is not found, return an error response
            if (!updatedBook) {
                return res.status(404).json({ error: "Book not found" });
            }

            // Return the updated book
            return res.status(200).json(updatedBook);
        } else {
            // Return an unauthorized response if the user is not an admin
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        // Handle any errors and send an error response
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

// Function to delete a book
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        // Get the logged-in user
        const user = req.user;

        // Check if the logged-in user is an admin
        if (user.isAdmin) {
            // Check if the provided ID is a valid mongoose ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid book ID" });
            }

            // Find and delete the book
            const deletedBook = await Book.findOneAndDelete({ _id: id });

            // If the book is not found, return an error response
            if (!deletedBook) {
                return res.status(404).json({ error: "Book not found" });
            }

            // Return a success message
            return res.status(200).json({ message: "Book successfully deleted" });
        } else {
            // Return an unauthorized response if the user is not an admin
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        // Handle any errors and send an error response
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

// Function to borrow a book
const borrowBook = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // Check if the logged-in user is not an admin
        if (!user.isAdmin) {
            // Check if the provided ID is a valid mongoose ID
            if (!mongoose.Types.ObjectId.isValid( id )) {
                return res.status(400).json({ error: "Invalid book ID" });
            }

            // Find the book
            const book = await Book.findById(id);

            // If the book is not found, return an error response
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }

            // Check if there are available stocks to borrow
            if (book.stocks > 0) {
                // Reduce the stocks by 1
                book.stocks -= 1;

                // Save the updated book
                await book.save();

                // Return a success message with the remaining stocks
                return res.status(200).json({
                    message: "Book borrowed successfully",
                    remainingStocks: book.stocks
                });
            } else {
                // Return an error response if there are no available stocks
                return res.status(400).json({ error: "No available stocks for borrowing" });
            }
        } else {
            // Return an unauthorized response if the user is an admin
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        // Handle any errors and send an error response
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

// Exporting the functions to be used in other files
module.exports = {
    createBook, 
    deleteBook, 
    getBooks,
    getSpecificBook,
    updateBook,
    borrowBook,
    searchBooks
};
