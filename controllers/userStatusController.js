const UserStatus = require('../models/userStatusModel');
const CurrentWorkInfo = require('../models/currentWorkInfoModel');
const PersonalInfo = require('../models/personalInfoModel');
const Documentation = require('../models/documentationModel');
const EducationInfo = require('../models/educationInfoModel');
const LegalCompliance = require('../models/legalComplianceModel');

// Helper function to update status in all collections
const updateStatusInAllCollections = async (userId, status, suspensionDetails = null) => {
    try {
        console.log('Starting status update for userId:', userId);
        console.log('New status:', status);
        
        // If status is not 'suspended', we'll unset suspensionDetails
        const updateData = status === 'suspended'
            ? { 
                $set: { 
                    status,
                    suspensionDetails 
                }
              }
            : { 
                $set: { status },
                $unset: { suspensionDetails: "" }
              };
            
        console.log('Update data:', JSON.stringify(updateData));

        // Update PersonalInfo
        const personalInfo = await PersonalInfo.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        );
        console.log('PersonalInfo update result:', personalInfo ? 'Success' : 'Not Found');

        // Update CurrentWorkInfo
        const workInfo = await CurrentWorkInfo.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        );
        console.log('CurrentWorkInfo update result:', workInfo ? 'Success' : 'Not Found');

        // Update Documentation
        const documentation = await Documentation.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        );
        console.log('Documentation update result:', documentation ? 'Success' : 'Not Found');

        // Update EducationInfo
        const education = await EducationInfo.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        );
        console.log('EducationInfo update result:', education ? 'Success' : 'Not Found');

        // Update LegalCompliance
        const legal = await LegalCompliance.findOneAndUpdate(
            { userId },
            updateData,
            { new: true }
        );
        console.log('LegalCompliance update result:', legal ? 'Success' : 'Not Found');

        console.log(`Status update completed for userId: ${userId}`);
    } catch (error) {
        console.error('Error updating status across collections:', error);
        throw error;
    }
};

// Resign user
exports.resignUser = async (req, res) => {
    try {
        const { workMailId } = req.body;
        console.log('Received resignation request for workMailId:', workMailId);

        // Get userId from workEmail
        const workInfo = await CurrentWorkInfo.findOne({ workMailId });
        if (!workInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found with the provided work email'
            });
        }

        const userId = workInfo.userId;
        console.log('Found userId:', userId);

        // Update status in all collections
        await updateStatusInAllCollections(userId, 'resigned');

        // Update or create status in UserStatus collection
        const userStatus = await UserStatus.findOneAndUpdate(
            { userId },
            { 
                status: 'resigned',
                $unset: { suspensionDetails: 1 }
            },
            { new: true, upsert: true }
        );

        console.log('UserStatus update result:', userStatus);

        res.status(200).json({
            success: true,
            message: 'User resigned successfully',
            data: userStatus
        });

    } catch (error) {
        console.error('Error processing resignation:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing resignation'
        });
    }
};

// Suspend user
exports.suspendUser = async (req, res) => {
    try {
        const { workMailId, fromDate, toDate, reason } = req.body;
        console.log('Received suspension request for workMailId:', workMailId);

        // Get userId from workEmail
        const workInfo = await CurrentWorkInfo.findOne({ workMailId });
        if (!workInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found with the provided work email'
            });
        }

        const userId = workInfo.userId;
        console.log('Found userId:', userId);
        const suspensionDetails = { fromDate, toDate, reason };

        // Update status in all collections
        await updateStatusInAllCollections(userId, 'suspended', suspensionDetails);

        // Update or create status in UserStatus collection
        const userStatus = await UserStatus.findOneAndUpdate(
            { userId },
            { 
                status: 'suspended',
                suspensionDetails
            },
            { new: true, upsert: true }
        );

        console.log('UserStatus update result:', userStatus);

        res.status(200).json({
            success: true,
            message: 'User suspended successfully',
            data: userStatus
        });

    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error suspending user'
        });
    }
};

// Terminate user
exports.terminateUser = async (req, res) => {
    try {
        const { workMailId } = req.body;
        console.log('Received termination request for workMailId:', workMailId);

        // Get userId from workEmail
        const workInfo = await CurrentWorkInfo.findOne({ workMailId });
        if (!workInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found with the provided work email'
            });
        }

        const userId = workInfo.userId;
        console.log('Found userId:', userId);

        // Update status in all collections
        await updateStatusInAllCollections(userId, 'terminated');

        // Update or create status in UserStatus collection
        const userStatus = await UserStatus.findOneAndUpdate(
            { userId },
            { 
                status: 'terminated',
                $unset: { suspensionDetails: 1 }
            },
            { new: true, upsert: true }
        );

        console.log('UserStatus update result:', userStatus);

        res.status(200).json({
            success: true,
            message: 'User terminated successfully',
            data: userStatus
        });

    } catch (error) {
        console.error('Error terminating user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error terminating user'
        });
    }
};

// Resume user
exports.resumeUser = async (req, res) => {
    try {
        const { workMailId } = req.body;
        console.log('Received resume request for workMailId:', workMailId);

        // Get userId from workEmail
        const workInfo = await CurrentWorkInfo.findOne({ workMailId });
        if (!workInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found with the provided work email'
            });
        }

        const userId = workInfo.userId;
        console.log('Found userId:', userId);

        // Update status in all collections
        await updateStatusInAllCollections(userId, 'active');

        // Update or create status in UserStatus collection
        const userStatus = await UserStatus.findOneAndUpdate(
            { userId },
            { 
                status: 'active',
                $unset: { suspensionDetails: 1 }
            },
            { new: true, upsert: true }
        );

        console.log('UserStatus update result:', userStatus);

        res.status(200).json({
            success: true,
            message: 'User resumed successfully',
            data: userStatus
        });

    } catch (error) {
        console.error('Error resuming user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error resuming user'
        });
    }
};

// Get user status
exports.getUserStatus = async (req, res) => {
    try {
        const { workMailId } = req.params;
        console.log('Received user status request for workMailId:', workMailId);

        // Get userId from workEmail
        const workInfo = await CurrentWorkInfo.findOne({ workMailId });
        if (!workInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found with the provided work email'
            });
        }

        const userId = workInfo.userId;
        console.log('Found userId:', userId);
        const userStatus = await UserStatus.findOne({ userId });

        console.log('UserStatus result:', userStatus);

        res.status(200).json({
            success: true,
            data: userStatus || { status: 'active' }
        });

    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching user status'
        });
    }
};
