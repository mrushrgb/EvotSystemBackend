#!/usr/bin/env node
/* Seed an admin user for development
   Usage:
     MONGO_URI="..." ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="Admin@123" node scripts/seedAdmin.js
   or
     node scripts/seedAdmin.js
   The script will default to admin@example.com / Admin@123 if env vars are not provided.
*/
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const run = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      console.log('If you want to recreate, delete the user from the database and re-run this script.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const admin = new User({
      name: 'Administrator',
      email: email.toLowerCase(),
      password: hashed,
      role: 'admin'
    });

    await admin.save();

    console.log('\nAdmin user created successfully');
    console.log('Email:', email.toLowerCase());
    console.log('Password:', password);
    console.log('\nIMPORTANT: These credentials are for development only. Change the password after first login.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

run();
