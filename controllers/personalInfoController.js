const PersonalInfo = require('../models/personalInfoModel');
const { User } = require('../models/userModel');

exports.addPersonalInfo = async (req, res) => {
  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists',
        error: 'A user with this email already exists'
      });
    }

    // Create a new user first
    const user = new User({
      email: req.body.email,
      role: 'employee',
      status: 'pending',
      formProgress: 'personal'
    });
    console.log('User has been saved:', user);
    await user.save();

    // Create personal info with user reference
    const personalInfo = new PersonalInfo({
      ...req.body,
      userId: user._id,  // Set the userId field
      hobbies: Array.isArray(req.body.hobbies) ? req.body.hobbies : [req.body.hobbies] // Convert hobbies to array if it's not
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
        personalInfo: personalInfo
      }
    });
  } catch (error) {
    console.error('Error in addPersonalInfo:', error);
    
    // If error occurs, try to clean up the user if it was created
    if (error.code === 11000) {
      // Delete the user if it was created
      try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          await User.findByIdAndDelete(user._id);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up user:', cleanupError);
      }

      return res.status(400).json({ 
        success: false,
        message: 'Email already exists',
        error: 'A user with this email already exists'
      });
    }

    res.status(400).json({ 
      success: false,
      message: error.message || 'Error saving personal information'
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
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'email role status formProgress');
    
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
