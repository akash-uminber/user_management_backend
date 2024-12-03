const jwt = require("jsonwebtoken");
const { User, HR } = require("../models/userModel");
const config = require("../config");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;

// Create email transporter
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

// Verify transporter
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email transporter error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Function to generate token
const generateToken = (userId) => {
    return jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: '24h'
    });
};

// register route 
exports.register = async (req, res) => {
    try {
        console.log('👉 Register endpoint hit');
        console.log('📦 Request body:', req.body);
        
        const { 
            email, password, firstName, lastName, phoneNumber, 
            DOB, gender, joiningDate 
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'email', 'password', 'firstName', 'lastName', 'phoneNumber',
            'DOB', 'gender', 'joiningDate'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check if user already exists
        const existingUser = await HR.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash the password
        console.log('🔒 Hashing password');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new HR instance with all fields
        const hrData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            DOB: new Date(DOB),
            gender,
            joiningDate: new Date(joiningDate),
            role: 'HR',
            status: 'pending',
            formProgress: 'personal'
        };

        // Handle photo upload
        if (req.file) {
            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'hr_photos',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                // Create a buffer stream and pipe it to the upload stream
                const bufferStream = require('stream').Readable.from(req.file.buffer);
                bufferStream.pipe(uploadStream);
            });

            // Add photo URL to HR data
            hrData.photo = result.secure_url;
        }

        console.log("📝 Creating new HR with data:", { ...hrData, password: '[HIDDEN]' });

        // Save HR
        const newHR = new HR(hrData);
        const savedHR = await newHR.save();

        console.log("✅ HR saved successfully");

        // Generate token
        const token = generateToken(savedHR._id);

        res.status(201).json({
            success: true,
            message: "HR registered successfully",
            token,
            user: {
                id: savedHR._id,
                firstName: savedHR.firstName,
                lastName: savedHR.lastName,
                email: savedHR.email,
                phoneNumber: savedHR.phoneNumber,
                role: savedHR.role,
                status: savedHR.status,
                formProgress: savedHR.formProgress,
                photo: savedHR.photo
            }
        });

    } catch (err) {
        console.error('❌ Error during HR registration:', err);
        res.status(500).json({
            success: false,
            message: 'Error registering HR',
            error: err.message
        });
    }
};

// login route
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('👉 Attempting to log in HR with email:', email);
        
        // Find HR by email
        const hr = await HR.findOne({ email });
        if (!hr) {
            console.log('❌ HR not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, hr.password);
        if (!isMatch) {
            console.log('❌ Password does not match');
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    
        console.log('✅ Password verified, generating OTP...');
    
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const tempToken = jwt.sign(
            { id: hr._id, email: hr.email },
            config.jwtSecret,
            { expiresIn: '5m' }
        );
    
        // Save OTP and temp token to HR
        hr.otp = otp;
        hr.tempToken = tempToken;
        hr.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
        await hr.save();
    
        // Send OTP via email
        const mailOptions = {
            from: config.email.user,
            to: hr.email,
            subject: 'Your Login OTP Code',
            text: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
            html: `
                <h2>Login Verification Code</h2>
                <p>Your OTP code is: <strong>${otp}</strong></p>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            `
        };
    
        await transporter.sendMail(mailOptions);
        console.log('📧 OTP sent to email:', hr.email);

        // Set temp token in cookie
        res.cookie('temp_token', tempToken, { 
            httpOnly: true, 
            maxAge: 5 * 60 * 1000, // 5 minutes
            secure: process.env.NODE_ENV === 'production' 
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            data: {
                email: hr.email,
                requiresOTP: true
            }
        });
    
    } catch (err) {
        console.error('❌ Error during login:', err);
        res.status(500).json({
            success: false,
            message: 'Error during login process',
            error: err.message
        });
    }
};

// Verify OTP route
exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const tempToken = req.cookies.temp_token;

        console.log('👉 Verifying OTP');

        if (!otp || !tempToken) {
            return res.status(400).json({
                success: false,
                message: 'OTP and temporary token are required'
            });
        }

        // Decode the temp token to get HR id
        let decodedToken;
        try {
            decodedToken = jwt.verify(tempToken, config.jwtSecret);
        } catch (err) {
            console.error('❌ Invalid or expired temp token');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session. Please login again.'
            });
        }

        const { id } = decodedToken;
        console.log('🔍 Looking up HR with id:', id);

        // Find HR and verify OTP
        const hr = await HR.findOne({ 
            _id: id,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!hr) {
            console.error('❌ Invalid or expired OTP');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        console.log('✅ OTP verified successfully');

        // Clear OTP and temp token
        hr.otp = undefined;
        hr.otpExpires = undefined;
        hr.tempToken = undefined;
        await hr.save();

        // Generate access token
        const accessToken = jwt.sign(
            { id: hr._id, email: hr.email, role: hr.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        // Clear temp token cookie and set access token
        res.clearCookie('temp_token');
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: hr._id,
                email: hr.email,
                role: hr.role,
                status: hr.status,
                formProgress: hr.formProgress,
                token: accessToken
            }
        });

    } catch (err) {
        console.error('❌ Error during OTP verification:', err);
        res.status(500).json({
            success: false,
            message: 'Error during OTP verification',
            error: err.message
        });
    }
};

// Forgot password functionality
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('👉 Forgot password request for email:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find HR by email
        const hr = await HR.findOne({ email });
        if (!hr) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate reset token and hash it
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save hashed token to database
        hr.resetPasswordToken = hashedToken;
        hr.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await hr.save();

        // Create reset URL with unhashed token
        const resetUrl = `http://localhost:3000/reset-password/${hashedToken}`;

        // Create email content
        const mailOptions = {
            from: config.email.user,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>You requested a password reset</h1>
                <p>Click this link to reset your password:</p>
                <a href="${resetUrl}" style="
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin: 10px 0;
                ">Reset Password</a>
                <p>This link will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('✉️ Reset password email sent successfully');

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to email'
        });

    } catch (err) {
        console.error('❌ Error in forgot password:', err);
        res.status(500).json({
            success: false,
            message: 'Error sending password reset email',
            error: err.message
        });
    }
};

// Reset password functionality
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        console.log('👉 Reset password request with token:', token);

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Find HR with valid reset token (token is already hashed)
        const hr = await HR.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!hr) {
            console.error('❌ Invalid or expired reset token');
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        console.log('✅ Valid reset token found for user:', hr.email);

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        hr.password = await bcrypt.hash(password, salt);
        
        // Clear reset token fields
        hr.resetPasswordToken = undefined;
        hr.resetPasswordExpires = undefined;

        await hr.save();
        console.log('✅ Password reset successful for user:', hr.email);

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (err) {
        console.error('❌ Error in reset password:', err);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: err.message
        });
    }
};
