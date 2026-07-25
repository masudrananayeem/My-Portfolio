const cloudinary = require('cloudinary').v2;

/**
 * Configures the Cloudinary SDK using credentials from .env
 * Get these for free at https://cloudinary.com/users/register/free
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
