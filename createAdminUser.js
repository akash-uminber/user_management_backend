require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const config = require('./config');

async function createAdminUser() {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (adminUser) {
      console.log('Admin user already exists');
    } else {
      const newAdminUser = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        password: 'Admin@1234',
      });
      await newAdminUser.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
