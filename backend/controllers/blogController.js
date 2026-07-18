const Blog = require('../models/Blog');

const getBlogs = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 6 } = req.query;
    const query = { published: true };
    if (search) query.$or = [{ title: new RegExp(search, 'i') }, { excerpt: new RegExp(search, 'i') }];
    if (category && category !== 'All') query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(query).sort('-createdAt').skip(skip).limit(Number(limit)).select('-content -comments'),
      Blog.countDocuments(query),
    ]);

    res.json({ success: true, count: blogs.length, total, pages: Math.ceil(total / Number(limit)), data: blogs });
  } catch (error) {
    next(error);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const createBlog = async (req, res, next) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });
    blog.comments.push(req.body);
    await blog.save();
    res.status(201).json({ success: true, data: blog.comments });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, addComment };
