const LegalCompliance = require('../models/legalComplianceModel');

exports.uploadDocuments = async (req, res) => {
  try {
    let legalCompliance = await LegalCompliance.findOne({ user: req.userId });
    if (legalCompliance) {
      // Update existing documents
      Object.assign(legalCompliance, req.body);
    } else {
      // Create new legal compliance document
      legalCompliance = new LegalCompliance({
        user: req.userId,
        ...req.body
      });
    }
    await legalCompliance.save();
    res.status(200).json({ message: 'Legal compliance documents uploaded successfully', legalCompliance });
  } catch (error) {
    res.status(400).json({ message: 'Error uploading legal compliance documents', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const legalCompliance = await LegalCompliance.findOne({ user: req.userId });
    if (!legalCompliance) {
      return res.status(404).json({ message: 'Legal compliance documents not found' });
    }
    res.json(legalCompliance);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving legal compliance documents', error: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { documentType } = req.params;
    const legalCompliance = await LegalCompliance.findOne({ user: req.userId });
    if (!legalCompliance) {
      return res.status(404).json({ message: 'Legal compliance documents not found' });
    }
    if (!(documentType in legalCompliance.toObject())) {
      return res.status(400).json({ message: 'Invalid document type' });
    }
    legalCompliance[documentType] = req.body.documentPath;
    await legalCompliance.save();
    res.json({ message: 'Legal compliance document updated successfully', legalCompliance });
  } catch (error) {
    res.status(400).json({ message: 'Error updating legal compliance document', error: error.message });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const result = await LegalCompliance.findOneAndDelete({ user: req.userId });
    if (!result) {
      return res.status(404).json({ message: 'Legal compliance documents not found' });
    }
    res.json({ message: 'Legal compliance documents deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting legal compliance documents', error: error.message });
  }
};
