const WorkInfo = require('../models/workInfoModel');
const { User } = require('../models/userModel');
const cloudinary = require('../config/cloudinary');

exports.addWorkExperience = async (req, res) => {
  try {
    console.log('📥 Request Files:', req.files);
    console.log('📥 Request Body:', req.body);

    const { userId, workData } = req.body;

    if (!userId || !workData) {
      return res.status(400).json({
        success: false,
        message: 'userId and workData are required'
      });
    }

    // Parse workData if it's a string
    let parsedWorkData;
    try {
      parsedWorkData = typeof workData === 'string'
        ? JSON.parse(workData)
        : workData;

      // Ensure it's an array
      if (!Array.isArray(parsedWorkData)) {
        parsedWorkData = [parsedWorkData];
      }

      console.log('📄 Parsed Work Data:', parsedWorkData);
    } catch (error) {
      console.error('❌ Error parsing workData:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid workData format',
        error: error.message
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if experience letter is provided
    if (!req.files || !req.files.experienceLetter) {
      return res.status(400).json({
        success: false,
        message: 'Experience letter is required'
      });
    }

    // Find or create work info document
    let workInfo = await WorkInfo.findOne({ userId });
    if (!workInfo) {
      workInfo = new WorkInfo({
        userId,
        workExperiences: []
      });
    }

    // Process each work experience
    for (const experience of parsedWorkData) {
      const file = req.files.experienceLetter[0];
      console.log('📄 Experience Letter File:', file);

      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `work_documents/${userId}/experience_letters`,
          resource_type: 'auto'
        });

        console.log('☁️ Cloudinary Upload Result:', result);

        // Add work experience entry with experience letter URL
        const workEntry = {
          ...experience,
          experienceLetter: result.secure_url
        };

        // Convert date strings to Date objects
        if (workEntry.startDate) {
          workEntry.startDate = new Date(workEntry.startDate);
        }
        if (workEntry.endDate) {
          workEntry.endDate = new Date(workEntry.endDate);
        }

        workInfo.workExperiences.push(workEntry);
      } catch (error) {
        console.error('❌ Error uploading to Cloudinary:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading experience letter',
          error: error.message
        });
      }
    }

    await workInfo.save();

    // Update user's form progress
    await User.findByIdAndUpdate(userId, {
      formProgress: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Work experience information added successfully',
      data: workInfo
    });

  } catch (error) {
    console.error('❌ Error in addWorkExperience:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding work experience',
      error: error.message
    });
  }
};

exports.getWorkInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const workInfo = await WorkInfo.findOne({ userId });

    if (!workInfo) {
      return res.status(404).json({
        success: false,
        message: 'Work information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workInfo
    });

  } catch (error) {
    console.error('❌ Error in getWorkInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving work information',
      error: error.message
    });
  }
};

exports.updateWorkInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const workInfo = await WorkInfo.findOne({ userId });

    if (!workInfo) {
      return res.status(404).json({
        success: false,
        message: 'Work information not found'
      });
    }

    // Update only the fields that are provided
    Object.keys(updates).forEach(key => {
      workInfo[key] = updates[key];
    });

    await workInfo.save();

    res.status(200).json({
      success: true,
      message: 'Work information updated successfully',
      data: workInfo
    });

  } catch (error) {
    console.error('❌ Error in updateWorkInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating work information',
      error: error.message
    });
  }
};
