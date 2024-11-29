const LegalCompliance = require('../models/legalComplianceModel');
const cloudinary = require('cloudinary').v2;

exports.uploadDocuments = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Starting document upload for user:', userId);
    
    if (!userId) {
      console.error('No userId provided');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get Cloudinary URLs from middleware
    const documentUrls = req.cloudinaryUrls;
    console.log('Document URLs received:', documentUrls);

    if (!documentUrls) {
      console.error('No document URLs received from middleware');
      return res.status(400).json({
        success: false,
        message: 'No documents were uploaded'
      });
    }

    // Check if all required documents are present
    const requiredFields = ['internshipAgreement', 'nonDisclosureAgreement', 'workAuthorization', 'digitalSignature'];
    const missingFields = requiredFields.filter(field => !documentUrls[field]);

    if (missingFields.length > 0) {
      console.error('Missing required documents:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingFields.join(', ')}`
      });
    }

    // Create or update legal compliance document
    console.log('Saving document URLs to database...');
    const legalCompliance = await LegalCompliance.findOneAndUpdate(
      { userId },
      {
        userId,
        internshipAgreement: documentUrls.internshipAgreement,
        nonDisclosureAgreement: documentUrls.nonDisclosureAgreement,
        workAuthorization: documentUrls.workAuthorization,
        digitalSignature: documentUrls.digitalSignature
      },
      { upsert: true, new: true }
    );

    console.log('Documents saved successfully:', legalCompliance);
    return res.status(200).json({
      success: true,
      message: 'Legal compliance documents uploaded successfully',
      data: {
        internshipAgreement: legalCompliance.internshipAgreement,
        nonDisclosureAgreement: legalCompliance.nonDisclosureAgreement,
        workAuthorization: legalCompliance.workAuthorization,
        digitalSignature: legalCompliance.digitalSignature
      }
    });

  } catch (error) {
    console.error('Error in uploadDocuments:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading legal compliance documents',
      error: error.message
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching documents for user:', userId);

    const legalCompliance = await LegalCompliance.findOne({ userId });

    if (!legalCompliance) {
      console.log('No documents found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'Legal compliance documents not found for this user'
      });
    }

    console.log('Documents found:', legalCompliance);
    return res.status(200).json({
      success: true,
      data: {
        internshipAgreement: legalCompliance.internshipAgreement,
        nonDisclosureAgreement: legalCompliance.nonDisclosureAgreement,
        workAuthorization: legalCompliance.workAuthorization,
        digitalSignature: legalCompliance.digitalSignature
      }
    });

  } catch (error) {
    console.error('Error in getDocuments:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving legal compliance documents',
      error: error.message
    });
  }
};

exports.deleteDocuments = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Deleting documents for user:', userId);

    // Find the documents first to get their URLs
    const legalCompliance = await LegalCompliance.findOne({ userId });

    if (!legalCompliance) {
      console.log('No documents found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'Legal compliance documents not found for this user'
      });
    }

    console.log('Found documents to delete:', legalCompliance);

    // Delete files from Cloudinary
    const documentFields = ['internshipAgreement', 'nonDisclosureAgreement', 'workAuthorization', 'digitalSignature'];
    const deleteResults = [];

    for (const field of documentFields) {
      if (legalCompliance[field]) {
        try {
          console.log(`Deleting ${field} from Cloudinary...`);
          // Extract public ID from Cloudinary URL
          const publicId = `legal_compliance/${userId}/${field}_${legalCompliance[field].split('/').pop().split('.')[0]}`;
          const result = await cloudinary.uploader.destroy(publicId);
          deleteResults.push({ field, result });
        } catch (error) {
          console.error(`Error deleting ${field} from Cloudinary:`, error);
          deleteResults.push({ field, error: error.message });
        }
      }
    }

    console.log('Cloudinary deletion results:', deleteResults);

    // Delete document from database
    await LegalCompliance.findOneAndDelete({ userId });
    console.log('Database record deleted successfully');

    return res.status(200).json({
      success: true,
      message: 'Legal compliance documents deleted successfully',
      deleteResults
    });

  } catch (error) {
    console.error('Error in deleteDocuments:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting legal compliance documents',
      error: error.message
    });
  }
};
