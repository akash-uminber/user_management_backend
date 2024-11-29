const CurrentWorkInfo = require('../models/currentWorkInfoModel');
const { User } = require('../models/userModel');

exports.addCurrentWorkInfo = async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    
    // Validate required fields
    const requiredFields = [
      'userId', 'employeeId', 'workMailId', 'department', 
      'designation', 'manager', 'teamLeader', 'reportingTo', 
      'workSchedule', 'startDate'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Convert form data to work data object
    const workData = {
      userId: req.body.userId,
      employeeId: req.body.employeeId,
      workMailId: req.body.workMailId,
      department: req.body.department,
      designation: req.body.designation,
      manager: req.body.manager,
      teamLeader: req.body.teamLeader,
      reportingTo: req.body.reportingTo,
      workSchedule: req.body.workSchedule,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
    };

    // Check if user exists
    const user = await User.findById(workData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current work info already exists
    let currentWorkInfo = await CurrentWorkInfo.findOne({ userId: workData.userId });
    if (currentWorkInfo) {
      return res.status(400).json({
        success: false,
        message: 'Current work information already exists for this user'
      });
    }

    // Create new current work info
    currentWorkInfo = new CurrentWorkInfo(workData);
    await currentWorkInfo.save();

    // Update user's form progress
    await User.findByIdAndUpdate(workData.userId, {
      formProgress: 'current_work_completed'
    });

    res.status(201).json({
      success: true,
      message: 'Current work information added successfully',
      data: currentWorkInfo
    });

  } catch (error) {
    console.error('Error in addCurrentWorkInfo:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding current work information',
      error: error.message
    });
  }
};

exports.getCurrentWorkInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching current work info for userId:', userId);

    const currentWorkInfo = await CurrentWorkInfo.findOne({ userId })
      .populate('userId', 'email role status formProgress');

    if (!currentWorkInfo) {
      console.log('No current work info found for userId:', userId);
      return res.status(404).json({
        success: false,
        message: 'Current work information not found'
      });
    }

    console.log('Found current work info:', currentWorkInfo);
    res.status(200).json({
      success: true,
      data: currentWorkInfo
    });
  } catch (error) {
    console.error('Error in getCurrentWorkInfo:', error);
    res.status(400).json({
      success: false,
      message: 'Error retrieving current work information',
      error: error.message
    });
  }
};

exports.updateCurrentWorkInfo = async (req, res) => {
  try {
    console.log('Update form data received:', req.body);
    
    const { userId } = req.params;
    
    // Validate required fields for update
    const requiredFields = [
      'employeeId', 'workMailId', 'department', 
      'designation', 'manager', 'teamLeader', 
      'reportingTo', 'workSchedule', 'startDate'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Convert form data for update
    const updateData = {
      employeeId: req.body.employeeId,
      workMailId: req.body.workMailId,
      department: req.body.department,
      designation: req.body.designation,
      manager: req.body.manager,
      teamLeader: req.body.teamLeader,
      reportingTo: req.body.reportingTo,
      workSchedule: req.body.workSchedule,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
    };

    // Find and update the work info
    const currentWorkInfo = await CurrentWorkInfo.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!currentWorkInfo) {
      return res.status(404).json({
        success: false,
        message: 'Current work information not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Current work information updated successfully',
      data: currentWorkInfo
    });

  } catch (error) {
    console.error('Error in updateCurrentWorkInfo:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating current work information',
      error: error.message
    });
  }
};
