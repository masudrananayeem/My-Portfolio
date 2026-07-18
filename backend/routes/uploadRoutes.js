const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload a single file (image or PDF) - returns the public URL
// @route   POST /api/upload
// @access  Private (admin)
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.status(201).json({
    success: true,
    url: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
