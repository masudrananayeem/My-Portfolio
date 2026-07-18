const Visitor = require('../models/Visitor');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Certificate = require('../models/Certificate');
const Message = require('../models/Message');

// @desc    Log a page visit (called once per page load from the frontend)
// @route   POST /api/stats/visit
// @access  Public
const logVisit = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    await Visitor.create({
      ip,
      page: req.body.page || '/',
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard summary numbers used by the admin dashboard charts
// @route   GET /api/stats/summary
// @access  Private (admin)
const getSummary = async (req, res, next) => {
  try {
    const [visitors, projects, blogs, certificates, messages, unreadMessages] = await Promise.all([
      Visitor.countDocuments(),
      Project.countDocuments(),
      Blog.countDocuments(),
      Certificate.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
    ]);

    // Visits grouped by day for the last 14 days (for the dashboard chart)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyVisits = await Visitor.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { visitors, projects, blogs, certificates, messages, unreadMessages, dailyVisits },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { logVisit, getSummary };
