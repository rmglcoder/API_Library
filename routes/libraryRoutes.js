//  Import the router from express.

const router = require('express').Router();

//  Import the middleware

const verify = require('../middlewares/authMiddleware');

//  Import the user controller.
const { createUser, loginUser, logoutUser, getUserProfile, deleteUser, getAllUserProfiles, updateUser, verifyr} = require('../controllers/libraryControllers')

// GET - Retrieve, POST - Creation, PUT/PATCH - Edit, DELETE- Delete

router.post('/create', verify, createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile/:id', verify, getUserProfile);
router.route('/profile/:id').delete(verify, deleteUser).put(verify, updateUser);
router.get('/all', verify, getAllUserProfiles);




// Export the routerc
module.exports = router;