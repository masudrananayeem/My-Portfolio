const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);

// Admin routes with file upload - IMPORTANT: field name must be 'image'
router.post('/', protect, upload.single('image'), handleMulterError, createProject);
router.put('/:id', protect, upload.single('image'), handleMulterError, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;