const Documentation = require('../models/documentationModel');

exports.uploadDocuments = async (req, res) => {
  try {
    let documentation = await Documentation.findOne({ user: req.userId });
    if (documentation) {
      // Update existing documentation
      Object.assign(documentation, req.body);
    } else {
      // Create new documentation
      documentation = new Documentation({
        user: req.userId,
        ...req.body
      });
    }
    await documentation.save();
    res.status(200).json({ message: 'Documents uploaded successfully', documentation, status: "success" });
  } catch (error) {
    res.status(400).json({ message: 'Error uploading documents', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documentation = await Documentation.findOne({ user: req.userId });
    if (!documentation) {
      return res.status(404).json({ message: 'Documentation not found' });
    }
    res.json({ documentation, status: "success" });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving documentation', error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { documentType } = req.params;
    const documentation = await Documentation.findOne({ user: req.userId });
    if (!documentation) {
      return res.status(404).json({ message: 'Documentation not found' });
    }
    if (!(documentType in documentation.toObject())) {
      return res.status(400).json({ message: 'Invalid document type' });
    }
    documentation[documentType] = req.body.documentPath;
    await documentation.save();
    res.json({ message: 'Document updated successfully', documentation, status: "success" });
  } catch (error) {
    res.status(400).json({ message: 'Error updating document', error: error.message });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const result = await Documentation.findOneAndDelete({ user: req.userId });
    if (!result) {
      return res.status(404).json({ message: 'Documentation not found' });
    }
    res.json({ message: 'Documentation deleted successfully', status: "success" });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting documentation', error: error.message });
  }
};
