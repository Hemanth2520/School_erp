import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

dotenv.config();

const email = (process.env.ADMIN_EMAIL ?? 'admin@school.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? 'School Administrator';

if (!password || password.length < 8) {
  throw new Error('Set ADMIN_PASSWORD to a password of at least 8 characters before running the seed command.');
}

async function seedAdmin() {
  await connectDatabase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account for ${email} already exists; no changes were made.`);
    return;
  }

  await User.create({ email, password, name, role: 'super_admin', isActive: true });
  console.log(`Created initial super-admin account for ${email}.`);
}

seedAdmin()
  .catch(error => {
    console.error('Unable to create initial administrator:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
