import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.model.js';
import Department from './models/Department.model.js';

dotenv.config();

async function seed() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB is not connected. Start MongoDB and try again.');
    process.exit(1);
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  const departments = [
    {
      name: 'General OPD',
      slug: 'general-opd',
      description: 'General outpatient department',
    },
    {
      name: 'Pediatrics',
      slug: 'pediatrics',
      description: 'Children and infant care',
    },
    {
      name: 'Dental',
      slug: 'dental',
      description: 'Dental clinic',
    },
  ];

  for (const dept of departments) {
    const existing = await Department.findOne({ slug: dept.slug });
    if (!existing) {
      await Department.create(dept);
      console.log(`Created department: ${dept.name}`);
    } else {
      console.log(`Department already exists: ${dept.name}`);
    }
  }

  const generalOpd = await Department.findOne({ slug: 'general-opd' });

  const users = [
    {
      name: 'Reception Desk',
      email: 'reception@hospitalq.com',
      password: 'password123',
      role: 'receptionist',
    },
    {
      name: 'Dr. Jane Smith',
      email: 'doctor@hospitalq.com',
      password: 'password123',
      role: 'doctor',
      department: generalOpd?._id || null,
    },
    {
      name: 'Admin User',
      email: 'admin@hospitalq.com',
      password: 'password123',
      role: 'admin',
    },
  ];

  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      const hashed = await bcrypt.hash(userData.password, saltRounds);
      await User.create({
        ...userData,
        password: hashed,
      });
      console.log(`Created user: ${userData.email} / password123`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
