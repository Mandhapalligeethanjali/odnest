const router = require('express').Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/',              getAllProjects);
router.get('/:id',           getProjectById);

// Private routes
router.post('/',             protect, authorize('client'), createProject);
router.put('/:id',           protect, authorize('client'), updateProject);
router.delete('/:id',        protect, authorize('client'), deleteProject);
router.get('/my/projects',   protect, getMyProjects);

module.exports = router;