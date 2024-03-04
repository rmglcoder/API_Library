const Book = require('../models/bookModel');
const User = require('../models/libraryModel');
const BorrowedBook = require('../models/borrowBookModel');
const mongoose = require('mongoose');

// BORROW
const borrowBook = async (req, res) => {
    try {
        const { id, quantity } = req.body;
        const user = req.user;

        // Check if the logged-in user is not an admin
        if (!user.isAdmin) {
            // Check if the provided ID is a valid mongoose ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid book ID" });
            }

            // Find the book
            const book = await Book.findById(id);

            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }

            // Check if there are available stocks to borrow
            if (book.stocks >= quantity) {
                // Reduce the stocks by the specified quantity
                book.stocks -= quantity;

                // Save the updated book
                await book.save();

                // Create an instance of BorrowedBook
                const borrowedBook = new BorrowedBook({
                    user: user._id,
                    book: book._id,
                    borrowDate: new Date(),
                    quantity: quantity, // Add quantity to BorrowedBook schema
                });

                // Save the borrowed book to the database
                await borrowedBook.save();

                return res.status(200).json({
                    message: "Books borrowed successfully",
                    remainingStocks: book.stocks,
                    borrowedBook: borrowedBook,
                });
            } else {
                return res.status(400).json({ error: "Insufficient stocks for borrowing" });
            }
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};
const returnBook = async (req, res) => {
    try {
        const { id, quantity } = req.body;
        const user = req.user;

        // Check if the logged-in user is not an admin
        if (!user.isAdmin) {
            // Check if the provided ID is a valid mongoose ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid borrowed book ID" });
            }

            // Find the borrowed book
            const borrowedBook = await BorrowedBook.findById(id);

            if (!borrowedBook) {
                return res.status(404).json({ error: "Borrowed book not found" });
            }

            // Check if the logged-in user is the one who borrowed the book
            if (borrowedBook.user.toString() !== user._id.toString()) {
                return res.status(403).json({ error: "You are not authorized to return this book" });
            }

            // Check if the book has already been returned
            if (borrowedBook.returned) {
                return res.status(400).json({ error: "Book has already been returned" });
            }

            // Check if the user is returning more items than borrowed
            if (quantity > borrowedBook.quantity) {
                return res.status(400).json({ error: "Cannot return more items than borrowed" });
            }

            // Set return date
            borrowedBook.returnDate = new Date();

            // Reduce the quantity returned
            borrowedBook.quantity -= quantity;

            // Update the returned status based on remaining quantity
            borrowedBook.returned = borrowedBook.quantity === 0;

            // Save the updated borrowed book
            await borrowedBook.save();

            // Find the corresponding book
            const book = await Book.findById(borrowedBook.book);

            if (!book) {
                return res.status(404).json({ error: "Corresponding book not found" });
            }

            // Increase the stocks by the quantity returned
            book.stocks += quantity;

            // Save the updated book
            await book.save();

            // Check if the user has already returned all the books
            if (borrowedBook.returned && borrowedBook.quantity === 0) {
                return res.status(200).json({
                    message: "Book returned successfully",
                    returnedBook: borrowedBook,
                    updatedBook: book,
                    status: "All books returned",
                });
            }

            return res.status(200).json({
                message: "Book returned successfully",
                returnedBook: borrowedBook,
                updatedBook: book,
                status: "Partial books returned",
            });
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal Server Error",
            stack: error.stack
        });
    }
};

const getAllBorrowedBooks = async (req, res) => {
    try {
        // Get the logged-in user
        const user = req.user;

        // Check if the logged-in user is an admin
        if (user.isAdmin) {
            // Retrieve all borrowed books, excluding certain fields
            const books = await BorrowedBook.find({}).select('-createdAt -updatedAt -__v');

            // Check if there are no borrowed books
            if (!books || books.length === 0) {
                return res.status(200).json({message: 'No borrowed books as of the moment'});
            }

            // Return the list of borrowed books
            return res.status(200).json(books);
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

const getBorrowedBooksByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the logged-in user is an admin
        const user = req.user;
        if (!user || !user.isAdmin) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if the provided ID is a valid mongoose ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Find the user
        const foundUser = await User.findById(userId);

        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find all borrowed books for the user
        const borrowedBooks = await BorrowedBook.find({ user: userId }).populate('book').select('-createdAt -updatedAt -__v');

        if (!borrowedBooks || borrowedBooks.length === 0) {
            return res.status(200).json({ message: 'No borrowed books for the user as of the moment' });
        }

        return res.status(200).json(borrowedBooks);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};

const getBorrowedBooksForUser = async (req, res) => {
    try {
        // Get the logged-in user
        const user = req.user;

        // Check if the user is not an admin
        if (!user.isAdmin) {
            // Find all borrowed books for the user
            const borrowedBooks = await BorrowedBook.find({ user: user._id })
                .populate('book')  // Populate the 'book' field with book details
                .select('-createdAt -updatedAt -__v');  // Exclude certain fields

            // Check if there are no borrowed books
            if (!borrowedBooks || borrowedBooks.length === 0) {
                return res.status(200).json({ message: 'No borrowed books for the user as of the moment' });
            }

            // Return the list of borrowed books
            return res.status(200).json(borrowedBooks);
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


module.exports = {
    borrowBook,
    returnBook,
    getAllBorrowedBooks,
    getBorrowedBooksByUser,
    getBorrowedBooksForUser
};
