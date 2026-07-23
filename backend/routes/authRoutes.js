const express = require('express');
const router = express.Router();
const { loginAdmin, getMe, updateMe, getPublicProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/profile', getPublicProfile);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
