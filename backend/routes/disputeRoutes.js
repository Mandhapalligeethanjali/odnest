const router = require('express').Router();
const { raiseDispute, getMyDisputes, getAllDisputes, resolveDispute } = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:projectId',              protect,                       raiseDispute);
router.get('/my',                       protect,                       getMyDisputes);
router.get('/',                         protect, authorize('admin'),   getAllDisputes);
router.put('/:disputeId/resolve',       protect, authorize('admin'),   resolveDispute);

module.exports = router;