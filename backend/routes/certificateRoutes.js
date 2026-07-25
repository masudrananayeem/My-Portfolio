const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCertificates);
router.post('/', protect, upload.single('image'), handleMulterError, createCertificate);
router.put('/:id', protect, upload.single('image'), handleMulterError, updateCertificate);
router.delete('/:id', protect, deleteCertificate);

module.exports = router;