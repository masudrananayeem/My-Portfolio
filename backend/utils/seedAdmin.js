/**
 * Run once to create the first admin account:
 *   npm run seed:admin
 * Reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const run = async () => {
  await connectDB();

  const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (exists) {
    console.log('Admin already exists:', exists.email);
    process.exit(0);
  }

  const admin = await Admin.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'superadmin',
  });

  console.log('Admin created successfully:', admin.email);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
