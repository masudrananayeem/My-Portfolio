const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');

// @desc    Upload a single file (image)
// @route   POST /api/upload
// @access  Private (admin)
router.post('/', protect, upload.single('file'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Cloudinary storage puts the hosted URL in req.file.path (multer-storage-cloudinary)
    res.status(201).json({
      success: true,
      url: req.file.path,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed' 
    });
  }
});

// @desc    Delete an image file from Cloudinary
// @route   DELETE /api/upload/:filename
// @access  Private (admin)
router.delete('/:filename', protect, async (req, res) => {
  try {
    const filename = req.params.filename;

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Cloudinary public_id is "folder/filename-without-extension"
    const publicId = `nayeem-portfolio/${filename.replace(/\.[^/.]+$/, '')}`;
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

module.exports = router;