const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinaryUpload');

// @desc    Upload a single file (image) to Cloudinary
// @route   POST /api/upload
// @access  Private (admin)
router.post('/', protect, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, 'portfolio/misc');

    res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
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

// @desc    Delete an image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private (admin)
// NOTE: publicId may contain slashes (folders), so it's passed URL-encoded
// e.g. DELETE /api/upload/portfolio%2Fmisc%2Fabc123
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await deleteFromCloudinary(publicId);
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
