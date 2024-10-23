const EducationInfo = require('../models/educationInfoModel');

exports.addEducation = async (req, res) => {
  try {
    let educationInfo = await EducationInfo.findOne({ user: req.userId });
    if (!educationInfo) {
      educationInfo = new EducationInfo({ user: req.userId, educations: [] });
    }
    educationInfo.educations.push(req.body);
    await educationInfo.save();
    res.status(201).json({ message: "Education information added successfully", educationInfo, status: "success" });
  } catch (error) {
    res.status(400).json({ message: 'Error adding education information', error: error.message });
  }
};

exports.getEducationInfo = async (req, res) => {
  try {
    const educationInfo = await EducationInfo.findOne({ user: req.userId });
    if (!educationInfo) {
      return res.status(404).json({ message: 'Education information not found' });
    }
    res.json({ educationInfo, status: "success" });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving education information', error: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const educationInfo = await EducationInfo.findOne({ user: req.userId });
    if (!educationInfo) {
      return res.status(404).json({ message: 'Education information not found' });
    }
    const educationIndex = educationInfo.educations.findIndex(edu => edu._id.toString() === educationId);
    if (educationIndex === -1) {
      return res.status(404).json({ message: 'Education entry not found' });
    }
    educationInfo.educations[educationIndex] = { ...educationInfo.educations[educationIndex].toObject(), ...req.body };
    await educationInfo.save();
    res.json({ message: 'Education information updated successfully', educationInfo, status: "success" });
  } catch (error) {
    res.status(400).json({ message: 'Error updating education information', error: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const educationInfo = await EducationInfo.findOne({ user: req.userId });
    if (!educationInfo) {
      return res.status(404).json({ message: 'Education information not found' });
    }
    educationInfo.educations = educationInfo.educations.filter(edu => edu._id.toString() !== educationId);
    await educationInfo.save();
    res.json({ message: 'Education entry deleted successfully', educationInfo, status: "success" });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting education entry', error: error.message });
  }
};
