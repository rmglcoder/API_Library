// Inside your route file
const router = require('express').Router();
const verify = require('../middlewares/authMiddleware');
const { borrowBook, returnBook, getAllBorrowedBooks, getBorrowedBooksByUser, getBorrowedBooksForUser} = require('../controllers/borrowBookControllers'); // Adjust the path based on your file structure

router.post('/',verify, borrowBook);
router.post('/return', verify, returnBook);
router.get('/get-borrowed-books', verify, getAllBorrowedBooks);
router.get('/get-borrowed-books-by-user/:userId', verify, getBorrowedBooksByUser);
router.get('/get-borrowed-books-for-user/all',  verify, getBorrowedBooksForUser);

module.exports = router;