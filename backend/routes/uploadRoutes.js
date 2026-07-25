const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');

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
    
    res.status(201).json({
      success: true,
      url: `/uploads/${req.file.filename}`,
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

// @desc    Delete an image file
// @route   DELETE /api/upload/:filename
// @access  Private (admin)
router.delete('/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid filename' 
      });
    }
    
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }
    
    fs.unlinkSync(filePath);
    
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