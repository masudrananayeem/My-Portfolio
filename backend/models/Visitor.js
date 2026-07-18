const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    ip: { type: String },
    page: { type: String, default: '/' },
    userAgent: { type: String },
    country: { type: String, default: 'Unknown' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
