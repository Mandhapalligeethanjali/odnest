const router = require('express').Router();
const { createMilestone, getProjectMilestones, submitMilestone, approveMilestone, rejectMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:projectId',              protect, authorize('client'),     createMilestone);
router.get('/:projectId',               protect,                          getProjectMilestones);
router.put('/:milestoneId/submit',      protect, authorize('freelancer'), submitMilestone);
router.put('/:milestoneId/approve',     protect, authorize('client'),     approveMilestone);
router.put('/:milestoneId/reject',      protect, authorize('client'),     rejectMilestone);
router.delete('/:milestoneId',          protect, authorize('client'),     deleteMilestone);

module.exports = router;