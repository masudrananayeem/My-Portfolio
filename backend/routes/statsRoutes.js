const express = require('express');
const router = express.Router();
const { logVisit, getSummary } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/visit', logVisit);
router.get('/summary', protect, getSummary);

module.exports = router;
