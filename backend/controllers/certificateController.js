const Certificate = require('../models/Certificate');
const fs = require('fs');
const path = require('path');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find().sort('order -issueDate');
    res.json({ 
      success: true, 
      count: certificates.length, 
      data: certificates 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new certificate (with file upload support)
// @route   POST /api/certificates
// @access  Private (admin)
const createCertificate = async (req, res, next) => {
  try {
    console.log('📝 Creating certificate...');
    console.log('📸 Uploaded file:', req.file);
    
    let certData = { ...req.body };
    
    if (req.file) {
      certData.image = `/uploads/${req.file.filename}`;
      console.log('✅ Image saved:', certData.image);
    }
    
    const certificate = await Certificate.create(certData);
    console.log('✅ Certificate created:', certificate._id);
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    console.error('❌ Create certificate error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update a certificate (with file upload support)
// @route   PUT /api/certificates/:id
// @access  Private (admin)
const updateCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    let updateData = { ...req.body };
    
    if (req.file) {
      if (certificate.image && certificate.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', certificate.image);
        try {
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Old image deleted:', oldPath);
          }
        } catch (err) {
          console.log('⚠️ Old image delete error:', err.message);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
      console.log('✅ New image saved:', updateData.image);
    } else if (updateData.existingImage) {
      updateData.image = updateData.existingImage;
      delete updateData.existingImage;
    }
    
    const updated = await Certificate.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Delete a certificate (and its image)
// @route   DELETE /api/certificates/:id
// @access  Private (admin)
const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    
    if (certificate.image && certificate.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', certificate.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Image deleted:', imagePath);
        }
      } catch (err) {
        console.log('⚠️ Image delete error:', err.message);
      }
    }
    
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getCertificates, 
  createCertificate, 
  updateCertificate, 
  deleteCertificate 
};