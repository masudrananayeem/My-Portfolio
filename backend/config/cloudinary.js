const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary is used instead of local disk storage because
 * Render/Vercel free hosting has an EPHEMERAL filesystem —
 * anything saved to local disk (via multer diskStorage) gets
 * wiped whenever the service restarts, redeploys, or wakes up
 * from sleep. Cloudinary gives us permanent, free image hosting
 * that survives restarts.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
