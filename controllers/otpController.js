const { authenticator } = require('otplib');
const User = require('../models/userModel');
const emailService = require('../services/emailService');
const config = require('../config');

// Set up authenticator options
authenticator.options = { step: parseInt(config.otpStep) };

exports.generateOTP = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = user.otpSecret || authenticator.generateSecret();
    const otp = authenticator.generate(secret);

    // Save the OTP secret if it's newly generated
    if (!user.otpSecret) {
      user.otpSecret = secret;
      await user.save();
    }

    console.log(`OTP for user ${user.email}: ${otp}`); // Add this line
    // Comment out the email sending for now
    // await emailService.sendOTPEmail(user.email, otp);

    res.json({ message: 'OTP generated and sent to your email', status: "success" });
  } catch (error) {
    console.error('Error in generateOTP:', error);
    res.status(500).json({ message: 'Failed to generate OTP', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.userId);

    if (!user || !user.otpSecret) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const isValid = authenticator.verify({ token: otp, secret: user.otpSecret });

    if (isValid) {
      res.json({ message: 'OTP verified successfully', status: "success" });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};
