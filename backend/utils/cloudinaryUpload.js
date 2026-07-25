const cloudinary = require('../config/cloudinary');

/**
 * Uploads an in-memory file buffer (from multer's memoryStorage) to
 * Cloudinary and resolves with the result ({ secure_url, public_id, ... }).
 *
 * Using upload_stream (instead of writing to disk first) means this works
 * identically on a local machine and on serverless hosts like Vercel/Render,
 * whose filesystems are read-only / ephemeral outside of /tmp.
 *
 * @param {Buffer} buffer   - file buffer, e.g. req.file.buffer
 * @param {string} folder   - Cloudinary folder to organize uploads, e.g. 'portfolio/projects'
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
function uploadBufferToCloudinary(buffer, folder = 'portfolio/misc') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Best-effort delete of a Cloudinary image given its public_id.
 * Never throws — logs and resolves so callers don't need try/catch.
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Cloudinary image deleted:', publicId);
  } catch (err) {
    console.log('⚠️ Cloudinary delete error:', err.message);
  }
}

/**
 * Extracts the Cloudinary public_id from a stored secure_url so it can be
 * passed to deleteFromCloudinary. Returns null for anything that isn't a
 * Cloudinary URL (e.g. legacy local "/uploads/xyz.jpg" paths from before
 * this migration — those are simply skipped rather than erroring).
 *
 * Example:
 *   https://res.cloudinary.com/demo/image/upload/v1690000000/portfolio/projects/abc123.jpg
 *   -> "portfolio/projects/abc123"
 */
function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return match ? match[1] : null;
}

module.exports = { uploadBufferToCloudinary, deleteFromCloudinary, extractPublicId };
