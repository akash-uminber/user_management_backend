const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: true, // Change this to true
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

exports.sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Your App" <${config.email.user}>`,
    to: to,
    subject: 'Your OTP for Authentication',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 5 minutes.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};
