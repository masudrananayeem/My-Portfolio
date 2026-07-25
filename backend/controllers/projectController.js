const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// @desc    Get all projects (public)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res, next) => {
  try {
    const { search, category, featured, sort = '-createdAt', page = 1, limit = 9 } = req.query;

    const query = {};
    if (search) query.$text = { $search: search };
    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.featured = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [projects, total] = await Promise.all([
      Project.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Project.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: projects.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project by slug
// @route   GET /api/projects/:slug
// @access  Public
const getProjectBySlug = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project (with file upload support)
// @route   POST /api/projects
// @access  Private (admin)
const createProject = async (req, res, next) => {
  try {
    console.log('📝 Creating project...');
    console.log('📦 Request body:', req.body);
    console.log('📸 Request file:', req.file);
    
    let projectData = { ...req.body };
    
    // Parse techStack if it's a string
    if (typeof projectData.techStack === 'string') {
      projectData.techStack = projectData.techStack.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    // Convert featured to boolean
    if (typeof projectData.featured === 'string') {
      projectData.featured = projectData.featured === 'true';
    }
    
    // Handle image upload
    if (req.file) {
      projectData.image = `/uploads/${req.file.filename}`;
      console.log('✅ Image saved with path:', projectData.image);
      
      // Verify file was actually saved
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        console.log('✅ File exists on disk:', filePath);
      } else {
        console.log('❌ File NOT found on disk:', filePath);
      }
    } else {
      console.log('⚠️ No image file uploaded');
    }
    
    const project = await Project.create(projectData);
    console.log('✅ Project created successfully:', project._id);
    console.log('✅ Image URL in DB:', project.image);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('❌ Create error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update a project (with file upload support)
// @route   PUT /api/projects/:id
// @access  Private (admin)
const updateProject = async (req, res, next) => {
  try {
    console.log('📝 Updating project...');
    console.log('📦 Request body:', req.body);
    console.log('📸 Request file:', req.file);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    let updateData = { ...req.body };
    
    // Parse techStack if it's a string
    if (typeof updateData.techStack === 'string') {
      updateData.techStack = updateData.techStack.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    // Convert featured to boolean
    if (typeof updateData.featured === 'string') {
      updateData.featured = updateData.featured === 'true';
    }
    
    // Handle image upload
    if (req.file) {
      // Delete old image
      if (project.image && project.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', project.image);
        try {
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Old image deleted:', oldPath);
          }
        } catch (err) {
          console.log('⚠️ Old image delete error:', err.message);
        }
      }
      // Save new image
      updateData.image = `/uploads/${req.file.filename}`;
      console.log('✅ New image saved:', updateData.image);
      
      // Verify file was saved
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        console.log('✅ File exists on disk:', filePath);
      } else {
        console.log('❌ File NOT found on disk:', filePath);
      }
    } else if (updateData.existingImage) {
      updateData.image = updateData.existingImage;
      delete updateData.existingImage;
    }
    
    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    console.log('✅ Project updated successfully');
    console.log('✅ Image URL in DB:', updated.image);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Update error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Delete a project (and its image)
// @route   DELETE /api/projects/:id
// @access  Private (admin)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Delete image file
    if (project.image && project.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', project.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Image deleted:', imagePath);
        }
      } catch (err) {
        console.log('⚠️ Image delete error:', err.message);
      }
    }
    
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getProjects, 
  getProjectBySlug, 
  createProject, 
  updateProject, 
  deleteProject 
};