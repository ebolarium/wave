const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Admin user data - CHANGE THESE VALUES
const adminData = {
  username: 'admin',
  email: 'barisboga@gmail.com',
  password: '951753',
  firstName: 'Barış',
  lastName: 'Boğa',
  role: 'admin'
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/energy-waves', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
      
      await mongoose.connection.close();
      return;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role: ${adminData.role}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();

