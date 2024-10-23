const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '15m' });
    console.log('Generated token:', token); // Add this line
    res.json({ token, message: 'Login successful. Please verify OTP.' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
