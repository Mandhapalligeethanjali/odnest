const router = require('express').Router();
const {
  getUserProfile,
  updateProfile,
  getFreelancers,
  deleteAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/freelancers',  getFreelancers);
router.get('/:id',          getUserProfile);

// Private routes
router.put('/profile',      protect, updateProfile);
router.delete('/profile',   protect, deleteAccount);

module.exports = router;