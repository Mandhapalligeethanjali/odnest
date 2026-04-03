const router = require('express').Router();
const { createReview, getUserReviews, getProjectReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:projectId',           protect, createReview);
router.get('/user/:userId',                   getUserReviews);
router.get('/project/:projectId',             getProjectReviews);
router.delete('/:reviewId',          protect, deleteReview);

module.exports = router;