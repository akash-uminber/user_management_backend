const PersonalInfo = require('../models/personalInfoModel');
const { User } = require('../models/userModel');

exports.addPersonalInfo = async (req, res) => {
  try {
    // Create a new user first
    const user = new User({
      email: req.body.email,
      role: 'employee',
      status: 'pending',
      formProgress: 'personal'
    });
    await user.save();

    // Create personal info with user reference
    const personalInfo = new PersonalInfo({
      ...req.body,
      userId: user._id  // Store user reference in personal info
    });
    await personalInfo.save();

    // Update user's form progress
    await User.findByIdAndUpdate(user._id, {
      formProgress: 'education'
    });

    res.status(201).json({
      success: true,
      message: "Personal information saved successfully",
      data: {
        userId: user._id,
        personalInfo: {
          ...personalInfo.toObject(),
          user: user._id  // Explicitly include user ID in response
        }
      }
    });
  } catch (error) {
    console.error('Error in addPersonalInfo:', error);
    
    // If error occurs, try to clean up the user if it was created
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists',
        error: 'A user with this email already exists'
      });
    }

    res.status(400).json({ 
      success: false,
      message: 'Error saving personal information', 
      error: error.message 
    });
  }
};

exports.getPersonalInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching personal info for userId:', userId);

    const personalInfo = await PersonalInfo.findOne({ userId })
      .populate('userId', 'email role status formProgress');

    if (!personalInfo) {
      console.log('No personal info found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Personal information not found'
      });
    }

    console.log('Found personal info:', personalInfo);
    res.status(200).json({
      success: true,
      data: personalInfo
    });
  } catch (error) {
    console.error('Error in getPersonalInfo:', error);
    res.status(400).json({
      success: false,
      message: 'Error retrieving personal information',
      error: error.message
    });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findOneAndUpdate(
      { user: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'email role status formProgress');
    
    if (!personalInfo) {
      return res.status(404).json({
        success: false,
        message: 'Personal information not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Personal information updated successfully',
      data: {
        personalInfo
      }
    });
  } catch (error) {
    console.error('Error in updatePersonalInfo:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating personal information',
      error: error.message
    });
  }
};
