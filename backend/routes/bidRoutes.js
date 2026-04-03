const router = require('express').Router();
const {
  submitBid,
  getProjectBids,
  getMyBids,
  acceptBid,
  rejectBid,
  deleteBid
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my/bids',            protect, authorize('freelancer'), getMyBids);
router.post('/:projectId',        protect, authorize('freelancer'), submitBid);
router.get('/:projectId',         protect, authorize('client'),     getProjectBids);
router.put('/:bidId/accept',      protect, authorize('client'),     acceptBid);
router.put('/:bidId/reject',      protect, authorize('client'),     rejectBid);
router.delete('/:bidId',          protect, authorize('freelancer'), deleteBid);

module.exports = router;