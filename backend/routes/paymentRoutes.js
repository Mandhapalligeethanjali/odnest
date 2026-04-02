const router = require('express').Router();
const { createOrder, verifyPayment, releasePayment, refundPayment, getMyPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, authorize('client'), createOrder);
router.post('/verify',       protect, authorize('client'), verifyPayment);
router.post('/release',      protect, authorize('client'), releasePayment);
router.post('/refund',       protect, authorize('client'), refundPayment);
router.get('/my',            protect,                      getMyPayments);

module.exports = router;