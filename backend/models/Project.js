const mongoose = require('mongoose');
const slugify = require('slugify');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    overview: { type: String, default: '' },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    techStack: [{ type: String, required: true }],
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'AI/ML', 'Other'],
      default: 'Full Stack',
    },
    githubLink: { type: String, default: '' },
    liveLink: { type: String, default: '' },
    videoDemo: { type: String, default: '' },
    features: [{ type: String }],
    challenges: { type: String, default: '' },
    solutions: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate a URL-safe slug from the title
projectSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-5);
  }
  next();
});

projectSchema.index({ title: 'text', description: 'text', techStack: 'text' });

module.exports = mongoose.model('Project', projectSchema);
