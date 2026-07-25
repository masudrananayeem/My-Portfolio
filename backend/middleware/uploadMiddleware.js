const multer = require('multer');
const path = require('path');

// Keep files in memory (as a Buffer) instead of writing to local disk.
// Local disk storage is what caused images to only exist on whichever
// single machine handled the upload (local dev vs. Vercel/Render) — those
// filesystems are separate, and serverless hosts wipe local disk between
// invocations anyway. Every upload buffer instead gets forwarded straight
// to Cloudinary (see utils/cloudinaryUpload.js), which both local dev and
// production read from, so images show up everywhere consistently.
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  console.log('📁 File received:', file.originalname, 'MIME:', file.mimetype);

  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG, BMP, ICO)'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Error handler
const handleMulterError = (err, req, res, next) => {
  console.log('❌ Multer Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = { upload, handleMulterError };
