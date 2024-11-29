const { HR } = require('../models/userModel');

// Update HR Profile
exports.updateProfile = async (req, res) => {
    try {
        const hrId = req.user.id; // Get HR ID from auth middleware
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            DOB,
            gender,
            joiningDate
        } = req.body;

        console.log('👉 Update profile request for HR:', hrId);

        // Find HR by ID
        const hr = await HR.findById(hrId);
        if (!hr) {
            return res.status(404).json({
                success: false,
                message: 'HR not found'
            });
        }

        // If email is being updated, check if new email already exists
        if (email && email !== hr.email) {
            const emailExists = await HR.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        // Update fields if provided
        if (firstName) hr.firstName = firstName;
        if (lastName) hr.lastName = lastName;
        if (email) hr.email = email;
        if (phoneNumber) hr.phoneNumber = phoneNumber;
        if (DOB) hr.DOB = DOB;
        if (gender) hr.gender = gender;
        if (joiningDate) hr.joiningDate = joiningDate;

        await hr.save();
        console.log('✅ Profile updated successfully');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                firstName: hr.firstName,
                lastName: hr.lastName,
                email: hr.email,
                phoneNumber: hr.phoneNumber,
                DOB: hr.DOB,
                gender: hr.gender,
                joiningDate: hr.joiningDate
            }
        });

    } catch (err) {
        console.error('❌ Error updating profile:', err);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: err.message
        });
    }
};

// Get HR Profile
exports.getProfile = async (req, res) => {
    try {
        const hrId = req.user.id;
        console.log('👉 Get profile request for HR:', hrId);

        const hr = await HR.findById(hrId).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
        if (!hr) {
            return res.status(404).json({
                success: false,
                message: 'HR not found'
            });
        }

        console.log('✅ Profile retrieved successfully');

        res.status(200).json({
            success: true,
            data: hr
        });

    } catch (err) {
        console.error('❌ Error getting profile:', err);
        res.status(500).json({
            success: false,
            message: 'Error getting profile',
            error: err.message
        });
    }
};
