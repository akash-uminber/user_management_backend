const PersonalInfo = require('../models/personalInfoModel');

exports.createPersonalInfo = async (req, res) => {
  try {
    const personalInfo = new PersonalInfo({
      ...req.body,
      user: req.userId // Assuming you're using the auth middleware
    });
    await personalInfo.save();
    res.status(201).json({ message: 'Personal information saved successfully', personalInfo });
  } catch (error) {
    res.status(400).json({ message: 'Error saving personal information', error: error.message });
  }
};

exports.getPersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findOne({ user: req.userId });
    if (!personalInfo) {
      return res.status(404).json({ message: 'Personal information not found' });
    }
    res.json(personalInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving personal information', error: error.message });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findOneAndUpdate(
      { user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!personalInfo) {
      return res.status(404).json({ message: 'Personal information not found' });
    }
    res.json({ message: 'Personal information updated successfully', personalInfo });
  } catch (error) {
    res.status(400).json({ message: 'Error updating personal information', error: error.message });
  }
};
