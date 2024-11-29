const Documentation = require('../models/documentationModel');
const { User } = require('../models/userModel');

exports.uploadDocuments = async (req, res) => {
  try {
    console.log('Received document upload request:', req.body);

    // Validate if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Create document paths object from uploaded files
    const documentPaths = {};
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        if (req.files[fieldName] && req.files[fieldName][0]) {
          // Convert Windows path to URL format
          documentPaths[fieldName] = req.files[fieldName][0].path.replace(/\\/g, '/');
        }
      });
    }

    let documentation = await Documentation.findOne({ userId: req.body.userId });
    if (documentation) {
      // Update existing documentation
      Object.assign(documentation, documentPaths);
    } else {
      // Create new documentation
      documentation = new Documentation({
        userId: req.body.userId,
        ...documentPaths
      });
    }
    
    await documentation.save();

    // Update user's form progress
    await User.findByIdAndUpdate(req.body.userId, {
      formProgress: 'documentation_completed'
    });

    res.status(200).json({ 
      success: true,
      message: 'Documents uploaded successfully', 
      data: documentation
    });
  } catch (error) {
    console.error('Error in uploadDocuments:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error uploading documents', 
      error: error.message 
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching documents for userId:', userId);

    const documentation = await Documentation.findOne({ userId })
      .populate('userId', 'email role status formProgress');

    if (!documentation) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentation not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: documentation 
    });
  } catch (error) {
    console.error('Error in getDocuments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving documentation', 
      error: error.message 
    });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { userId, documentType } = req.params;
    console.log('Updating document:', { userId, documentType, body: req.body });

    const documentation = await Documentation.findOne({ userId });
    if (!documentation) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentation not found' 
      });
    }

    if (!(documentType in documentation.toObject())) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid document type' 
      });
    }

    documentation[documentType] = req.body.documentPath;
    await documentation.save();

    res.status(200).json({ 
      success: true,
      message: 'Document updated successfully', 
      data: documentation
    });
  } catch (error) {
    console.error('Error in updateDocument:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating document', 
      error: error.message 
    });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Deleting documents for userId:', userId);

    const documentation = await Documentation.findOneAndDelete({ userId });
    if (!documentation) {
      return res.status(404).json({ 
        success: false,
        message: 'Documentation not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Documents deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteDocuments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting documents', 
      error: error.message 
    });
  }
};
