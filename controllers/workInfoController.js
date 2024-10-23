const WorkInfo = require('../models/workInfoModel');

exports.addWorkExperience = async (req, res) => {
  try {
    let workInfo = await WorkInfo.findOne({ user: req.userId });
    if (!workInfo) {
      workInfo = new WorkInfo({ user: req.userId, workExperiences: [] });
    }
    workInfo.workExperiences.push(req.body);
    await workInfo.save();
    res.status(201).json({ message: 'Work experience added successfully', workInfo });
  } catch (error) {
    res.status(400).json({ message: 'Error adding work experience', error: error.message });
  }
};

exports.getWorkInfo = async (req, res) => {
  try {
    const workInfo = await WorkInfo.findOne({ user: req.userId });
    if (!workInfo) {
      return res.status(404).json({ message: 'Work information not found' });
    }
    res.json(workInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving work information', error: error.message });
  }
};

exports.updateWorkExperience = async (req, res) => {
  try {
    const { workExperienceId } = req.params;
    const workInfo = await WorkInfo.findOne({ user: req.userId });
    if (!workInfo) {
      return res.status(404).json({ message: 'Work information not found' });
    }
    const experienceIndex = workInfo.workExperiences.findIndex(exp => exp._id.toString() === workExperienceId);
    if (experienceIndex === -1) {
      return res.status(404).json({ message: 'Work experience entry not found' });
    }
    workInfo.workExperiences[experienceIndex] = { ...workInfo.workExperiences[experienceIndex].toObject(), ...req.body };
    await workInfo.save();
    res.json({ message: 'Work experience updated successfully', workInfo });
  } catch (error) {
    res.status(400).json({ message: 'Error updating work experience', error: error.message });
  }
};

exports.deleteWorkExperience = async (req, res) => {
  try {
    const { workExperienceId } = req.params;
    const workInfo = await WorkInfo.findOne({ user: req.userId });
    if (!workInfo) {
      return res.status(404).json({ message: 'Work information not found' });
    }
    workInfo.workExperiences = workInfo.workExperiences.filter(exp => exp._id.toString() !== workExperienceId);
    await workInfo.save();
    res.json({ message: 'Work experience deleted successfully', workInfo });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting work experience', error: error.message });
  }
};
