const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Images are uploaded straight to Cloudinary (permanent, free hosting)
 * instead of the local disk. Local disk storage does NOT persist on
 * Render/Vercel free hosting -- files disappear on every restart/redeploy.
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nayeem-portfolio',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return 'project-' + uniqueSuffix;
    },
  },
});

// File filter (double-checks type before it even reaches Cloudinary)
const fileFilter = (req, file, cb) => {
  console.log('📁 File received:', file.originalname, 'MIME:', file.mimetype);

  const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico/;
  const mime = file.mimetype;

  if (allowedTypes.test(mime)) {
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
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.log('❌ Upload Error:', err);
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

module.exports = { upload, handleMulterError };
