const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Login admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in admin profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, admin: req.admin });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile (name / avatar)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    admin.name = req.body.name || admin.name;
    admin.avatar = req.body.avatar || admin.avatar;
    if (req.body.password) admin.password = req.body.password;
    await admin.save();
    res.json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email, avatar: admin.avatar } });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginAdmin, getMe, updateMe };
