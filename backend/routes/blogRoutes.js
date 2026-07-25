const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/:slug/comments', addComment);
router.post('/', protect, upload.single('image'), handleMulterError, createBlog);
router.put('/:id', protect, upload.single('image'), handleMulterError, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;