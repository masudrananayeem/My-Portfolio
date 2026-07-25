const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');

// @desc    Get all blogs (public)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 6 } = req.query;
    const query = { published: true };
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') }, 
        { excerpt: new RegExp(search, 'i') }
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .select('-content -comments'),
      Blog.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: blogs.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post (with file upload support)
// @route   POST /api/blogs
// @access  Private (admin)
const createBlog = async (req, res, next) => {
  try {
    console.log('📝 Creating blog...');
    console.log('📸 Uploaded file:', req.file);
    
    let blogData = { ...req.body };
    
    if (req.file) {
      blogData.coverImage = `/uploads/${req.file.filename}`;
      console.log('✅ Cover image saved:', blogData.coverImage);
    }
    
    const blog = await Blog.create(blogData);
    console.log('✅ Blog created:', blog._id);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('❌ Create blog error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

// @desc    Update a blog post (with file upload support)
// @route   PUT /api/blogs/:id
// @access  Private (admin)
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    let updateData = { ...req.body };
    
    if (req.file) {
      if (blog.coverImage && blog.coverImage.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', blog.coverImage);
        try {
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('🗑️ Old cover image deleted:', oldPath);
          }
        } catch (err) {
          console.log('⚠️ Old image delete error:', err.message);
        }
      }
      updateData.coverImage = `/uploads/${req.file.filename}`;
      console.log('✅ New cover image saved:', updateData.coverImage);
    } else if (updateData.existingImage) {
      updateData.coverImage = updateData.existingImage;
      delete updateData.existingImage;
    }
    
    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, {
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

// @desc    Delete a blog post (and its cover image)
// @route   DELETE /api/blogs/:id
// @access  Private (admin)
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    if (blog.coverImage && blog.coverImage.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', blog.coverImage);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Cover image deleted:', imagePath);
        }
      } catch (err) {
        console.log('⚠️ Image delete error:', err.message);
      }
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a blog post
// @route   POST /api/blogs/:slug/comments
// @access  Public
const addComment = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and message are required' 
      });
    }
    
    blog.comments.push({ name, email, message });
    await blog.save();
    
    res.status(201).json({ 
      success: true, 
      data: blog.comments,
      message: 'Comment added successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  addComment 
};