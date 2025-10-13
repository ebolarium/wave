const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Define users to create - MODIFY AS NEEDED
const users = [
  {
    username: 'admin',
    email: 'admin@energywaves.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    username: 'john_doe',
    email: 'john@energywaves.com',
    password: 'User123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user'
  },
  {
    username: 'jane_smith',
    email: 'jane@energywaves.com',
    password: 'User123!',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/energy-waves', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  Skipped: ${userData.username} (already exists)`);
        skipped++;
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${userData.username} (${userData.role})`);
      created++;
    }

    console.log('');
    console.log('=================================');
    console.log(`Created: ${created} user(s)`);
    console.log(`Skipped: ${skipped} user(s)`);
    console.log('=================================');

    if (created > 0) {
      console.log('');
      console.log('Default Credentials:');
      users.forEach(user => {
        console.log(`  ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
      });
      console.log('');
      console.log('⚠️  IMPORTANT: Change passwords after first login!');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
}

// Run the script
seedUsers();



