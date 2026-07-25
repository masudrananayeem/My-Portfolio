const Certificate = require('../models/Certificate');
const { uploadBufferToCloudinary, deleteFromCloudinary, extractPublicId } = require('../utils/cloudinaryUpload');

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
      const result = await uploadBufferToCloudinary(req.file.buffer, 'portfolio/certificates');
      certData.image = result.secure_url;
      console.log('✅ Image uploaded to Cloudinary:', certData.image);
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
      const oldPublicId = extractPublicId(certificate.image);
      if (oldPublicId) await deleteFromCloudinary(oldPublicId);

      const result = await uploadBufferToCloudinary(req.file.buffer, 'portfolio/certificates');
      updateData.image = result.secure_url;
      console.log('✅ New image uploaded to Cloudinary:', updateData.image);
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
    
    const publicId = extractPublicId(certificate.image);
    if (publicId) await deleteFromCloudinary(publicId);
    
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