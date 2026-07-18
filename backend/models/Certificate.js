const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    image: { type: String, required: true },
    pdfUrl: { type: String, default: '' },
    verifyLink: { type: String, default: '' },
    issueDate: { type: Date, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
