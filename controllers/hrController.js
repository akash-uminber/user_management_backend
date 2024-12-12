const { HR } = require('../models/userModel');
const jwt = require("jsonwebtoken");
const config = require("../config");

// Update HR Profile
exports.updateProfile = async (req, res) => {
    const { hrId, firstName, lastName, email, phoneNumber, DOB, gender, joiningDate, photo } = req.body;

    // Ensure hrId is present
    if (!hrId) {
        return res.status(400).json({ error: 'HR ID is required' });
    }

    try {
        const hr = await HR.findById(hrId); // Assuming you are using Mongoose

        if (!hr) {
            return res.status(404).json({ error: 'HR record not found' });
        }

        // Update fields
        if (firstName) hr.firstName = firstName;
        if (lastName) hr.lastName = lastName;
        if (email) hr.email = email;
        if (phoneNumber) hr.phoneNumber = phoneNumber;
        if (DOB) hr.DOB = DOB;
        if (gender) hr.gender = gender;
        if (joiningDate) hr.joiningDate = joiningDate;
        if (photo) hr.photo = photo;

        await hr.save();
        return res.status(200).json({ success: true, data: hr });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get HR Profile
// exports.getProfile = async (req, res) => {
//     try {
//         // const hrId = req.user._id;
//         const hrId = req.cookies._id;
//         console.log('👉 Get profile request for HR:', hrId);

//         const hr = await HR.findById(hrId).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
//         if (!hr) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'HR not found'
//             });
//         }

//         console.log('✅ Profile retrieved successfully');

//         res.status(200).json({
//             success: true,
//             data: hr
//         });

//     } catch (err) {
//         console.error('❌ Error getting profile:', err);
//         res.status(500).json({
//             success: false,
//             message: 'Error getting profile',
//             error: err.message
//         });
//     }
// };

// Get HR Profile
exports.getProfile = async (req, res) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Decode token to get HR ID
        const decoded = jwt.verify(token, config.jwtSecret);
        const hrId = decoded.id;  // The ID is stored as 'id' in the token

        console.log('👉 Get profile request for HR:', hrId);

        // Fetch the HR record from the database
        const hr = await HR.findById(hrId)
            .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');

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
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error getting profile',
            error: err.message
        });
    }
};
