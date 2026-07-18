const Message = require('../models/Message');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit contact form (saves to DB + emails the admin)
// @route   POST /api/contact
// @access  Public
const sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const saved = await Message.create({ name, email, subject, message });

    // Email sending is best-effort: if SMTP isn't configured yet, the
    // message is still saved to the database and visible in the dashboard.
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await sendEmail({
          to: process.env.CONTACT_RECEIVER_EMAIL,
          subject: `New portfolio message: ${subject}`,
          replyTo: email,
          html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
        });
      }
    } catch (emailError) {
      console.error('Email send failed (message was still saved):', emailError.message);
    }

    res.status(201).json({ success: true, message: 'Message sent successfully', data: saved });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private (admin)
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort('-createdAt');
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a message as read / delete
// @route   PUT/DELETE /api/contact/:id
// @access  Private (admin)
const markAsRead = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, markAsRead, deleteMessage };
