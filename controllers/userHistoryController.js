const Documentation = require('../models/documentationModel');
const PersonalInfo = require('../models/personalInfoModel');
const CurrentWorkInfo = require('../models/currentWorkInfoModel');

// Helper function to generate username
const generateUsername = (fullName, employeeId) => {
    // Take the first part of the full name (before any spaces)
    const firstName = fullName.split(' ')[0].toLowerCase();
    
    // Get last 3 digits of employee ID
    const idSuffix = employeeId.slice(-3);
    
    // Combine them
    return `${firstName}${idSuffix}`;
};

// Get user history with all required fields
exports.getUserHistory = async (req, res) => {
    try {
        // Get all users' data
        const users = await PersonalInfo.aggregate([
            // Start with personal info
            {
                $lookup: {
                    from: 'currentworkinfos',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'workInfo'
                }
            },
            {
                $unwind: '$workInfo'
            },
            {
                $lookup: {
                    from: 'documentations',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'documentation'
                }
            },
            {
                $unwind: '$documentation'
            },
            // Project only the required fields
            {
                $project: {
                    userId: 1,
                    photo: '$documentation.passportSizePhoto',
                    fullName: 1,
                    contact: 1,
                    employeeId: '$workInfo.employeeId',
                    workEmail: '$workInfo.workMailId',
                    department: '$workInfo.department',
                    designation: '$workInfo.designation'
                }
            },
            // Sort by employeeId
            {
                $sort: { 'workInfo.employeeId': 1 }
            }
        ]);

        // Transform the data to add serial numbers and generate usernames
        const userHistory = users.map((user, index) => ({
            srNo: index + 1,
            photo: user.photo,
            username: generateUsername(user.fullName, user.employeeId),
            employeeId: user.employeeId,
            fullName: user.fullName,
            contact: user.contact,
            workEmail: user.workEmail,
            department: user.department,
            designation: user.designation
        }));

        res.status(200).json({
            success: true,
            count: userHistory.length,
            data: userHistory,
            message: 'User history fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user history',
            error: error.message
        });
    }
};

// Get history for a specific user
exports.getUserHistoryById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user's personal info
        const personalInfo = await PersonalInfo.findOne({ userId });
        if (!personalInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's work info
        const workInfo = await CurrentWorkInfo.findOne({ userId });
        if (!workInfo) {
            return res.status(404).json({
                success: false,
                message: 'Work information not found'
            });
        }

        // Get user's documentation
        const documentation = await Documentation.findOne({ userId });
        if (!documentation) {
            return res.status(404).json({
                success: false,
                message: 'Documentation not found'
            });
        }

        // Combine the data
        const userHistory = {
            srNo: 1,
            photo: documentation.passportSizePhoto,
            username: generateUsername(personalInfo.fullName, workInfo.employeeId),
            employeeId: workInfo.employeeId,
            fullName: personalInfo.fullName,
            contact: personalInfo.contact,
            workEmail: workInfo.workMailId,
            department: workInfo.department,
            designation: workInfo.designation
        };

        res.status(200).json({
            success: true,
            data: userHistory,
            message: 'User history fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user history',
            error: error.message
        });
    }
};
