/**
 * ONE-TIME MIGRATION — run this ONCE, from your local machine only.
 *
 * Why: before this fix, uploaded images were saved to the backend's local
 * "uploads/" folder. Any project/blog/certificate you created that way has
 * an `image` (or `coverImage`) value like "/uploads/project-123.jpg" in
 * MongoDB — pointing at a file that only exists on whichever single
 * machine (your laptop, or the live server) happened to receive that
 * upload. This script walks every such record, finds the matching file in
 * your local backend/uploads/ folder, uploads it to Cloudinary, and
 * rewrites the DB record to point at the new Cloudinary URL — so the image
 * shows up everywhere from then on.
 *
 * Run with:
 *   npm run migrate:images
 *
 * Safe to run more than once — records that already have a Cloudinary
 * (https://res.cloudinary.com/...) URL are skipped automatically.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const { uploadBufferToCloudinary } = require('./cloudinaryUpload');

const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Certificate = require('../models/Certificate');

const uploadsDir = path.join(__dirname, '../uploads');

async function migrateField(Model, field, folder) {
  const docs = await Model.find({ [field]: { $regex: '^/uploads/' } });
  console.log(`\n📂 ${Model.modelName}: found ${docs.length} record(s) with a local "${field}" path`);

  for (const doc of docs) {
    const localPath = path.join(uploadsDir, path.basename(doc[field]));

    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠️  Skipping "${doc[field]}" (${doc._id}) — file not found locally at ${localPath}`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(localPath);
      const result = await uploadBufferToCloudinary(buffer, folder);
      doc[field] = result.secure_url;
      await doc.save();
      console.log(`  ✅ Migrated ${doc._id}: ${localPath} -> ${result.secure_url}`);
    } catch (err) {
      console.log(`  ❌ Failed to migrate ${doc._id}:`, err.message);
    }
  }
}

const run = async () => {
  await connectDB();

  if (!fs.existsSync(uploadsDir)) {
    console.log('No local uploads/ folder found — nothing to migrate.');
    process.exit(0);
  }

  await migrateField(Project, 'image', 'portfolio/projects');
  await migrateField(Blog, 'coverImage', 'portfolio/blogs');
  await migrateField(Certificate, 'image', 'portfolio/certificates');

  console.log('\n🎉 Migration complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
