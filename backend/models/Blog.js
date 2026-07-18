const mongoose = require('mongoose');
const slugify = require('slugify');

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    coverImage: { type: String, default: '' },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // Markdown content
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    published: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-5);
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
