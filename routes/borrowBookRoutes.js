// Inside your route file
const router = require('express').Router();
const verify = require('../middlewares/authMiddleware');
const { borrowBook, returnBook, getAllBorrowedBooks, getBorrowedBooksByUser} = require('../controllers/borrowBookControllers'); // Adjust the path based on your file structure

router.post('/',verify, borrowBook);
router.put('/return', verify, returnBook);
router.get('/get-borrowed-books', verify, getAllBorrowedBooks);
router.get('/get-borrowed-books-by-user/:userId', verify, getBorrowedBooksByUser);

module.exports = router;