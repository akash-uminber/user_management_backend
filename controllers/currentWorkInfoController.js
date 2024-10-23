const CurrentWorkInfo = require('../models/currentWorkInfoModel');

exports.createOrUpdateWorkInfo = async (req, res) => {
  try {
    let workInfo = await CurrentWorkInfo.findOne({ user: req.userId });
    if (workInfo) {
      // Update existing work info
      Object.assign(workInfo, req.body);
    } else {
      // Create new work info
      workInfo = new CurrentWorkInfo({
        user: req.userId,
        ...req.body
      });
    }
    await workInfo.save();
    res.status(200).json({ message: 'Work information saved successfully', workInfo });
  } catch (error) {
    res.status(400).json({ message: 'Error saving work information', error: error.message });
  }
};

exports.getWorkInfo = async (req, res) => {
  try {
    const workInfo = await CurrentWorkInfo.findOne({ user: req.userId });
    if (!workInfo) {
      return res.status(404).json({ message: 'Work information not found' });
    }
    res.json(workInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving work information', error: error.message });
  }
};

exports.deleteWorkInfo = async (req, res) => {
  try {
    const result = await CurrentWorkInfo.findOneAndDelete({ user: req.userId });
    if (!result) {
      return res.status(404).json({ message: 'Work information not found' });
    }
    res.json({ message: 'Work information deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting work information', error: error.message });
  }
};
