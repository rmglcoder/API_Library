const router = require('express').Router();

const verify = require('../middlewares/authMiddleware')

const {getBooks, getSpecificBook,createBook, deleteBook, updateBook, searchBooks} = require('../controllers/bookControllers')

router.route('/create').post(verify, createBook);
router.get('/get-books', getBooks)
router.get('/search-books', searchBooks)
router.get('/get-specific-book/:id', getSpecificBook)
router.route('/:id').put(verify, updateBook).delete(verify, deleteBook)

module.exports = router;
