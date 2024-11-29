const EducationInfo = require('../models/educationInfoModel');
const { User } = require('../models/userModel');
const cloudinary = require('../config/cloudinary');

exports.addEducation = async (req, res) => {
  try {
    const { userId, educationData } = req.body;
    
    if (!userId || !educationData) {
      return res.status(400).json({
        success: false,
        message: 'userId and educationData are required'
      });
    }

    // Parse educationData if it's a string
    let parsedEducationData;
    try {
      if (typeof educationData === 'string') {
        // Clean the string before parsing
        const cleanedData = educationData.trim().replace(/}\s*]}\s*$/, '}]');
        parsedEducationData = JSON.parse(cleanedData);
      } else {
        parsedEducationData = educationData;
      }

      // Ensure it's an array
      if (!Array.isArray(parsedEducationData)) {
        parsedEducationData = [parsedEducationData];
      }
    } catch (error) {
      console.error('Error parsing educationData:', error);
      console.log('Received educationData:', educationData);
      return res.status(400).json({
        success: false,
        message: 'Invalid educationData format',
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

    // Log received files
    console.log('Files in request:', req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Find or create education info document
    let educationInfo = await EducationInfo.findOne({ userId });
    if (!educationInfo) {
      educationInfo = new EducationInfo({
        userId,
        educations: []
      });
    }

    // Process each education level
    for (const education of parsedEducationData) {
      const documents = {};
      const level = education.level.toUpperCase(); // Ensure uppercase for enum matching
      console.log(`Processing education level: ${level}`);

      try {
        // Validate required files based on education level
        if (['SSC', 'HSC'].includes(level)) {
          const prefix = level.toLowerCase() + '_';
          const leavingCertFile = req.files[prefix + 'leavingCertificate']?.[0];
          console.log(`${level} - Looking for file: ${prefix}leavingCertificate`, leavingCertFile ? 'Found' : 'Not found');
          
          if (!leavingCertFile) {
            throw new Error(`${level} requires leaving certificate file (${prefix}leavingCertificate)`);
          }

          console.log(`Uploading ${level} leaving certificate to Cloudinary...`);
          const result = await cloudinary.uploader.upload(leavingCertFile.path, {
            folder: `education_documents/${userId}/${level.toLowerCase()}`,
            resource_type: 'auto'
          });
          documents.leavingCertificate = result.secure_url;
          console.log(`${level} leaving certificate uploaded successfully`);
        } 
        else if (['DIPLOMA', 'DEGREE', 'MASTER'].includes(level)) {
          const prefix = level.toLowerCase() + '_';
          const marksheetFile = req.files[prefix + 'marksheet']?.[0];
          const certificateFile = req.files[prefix + 'certificate']?.[0];
          console.log(`${level} - Looking for files:`, {
            marksheet: marksheetFile ? 'Found' : 'Not found',
            certificate: certificateFile ? 'Found' : 'Not found'
          });

          if (!marksheetFile) {
            throw new Error(`${level} requires marksheet file (${prefix}marksheet)`);
          }

          if (!certificateFile) {
            throw new Error(`${level} requires certificate file (${prefix}certificate)`);
          }

          // Upload marksheet
          console.log(`Uploading ${level} marksheet to Cloudinary...`);
          const marksheetResult = await cloudinary.uploader.upload(marksheetFile.path, {
            folder: `education_documents/${userId}/${level.toLowerCase()}`,
            resource_type: 'auto'
          });
          documents.marksheet = marksheetResult.secure_url;
          console.log(`${level} marksheet uploaded successfully`);

          // Upload certificate
          console.log(`Uploading ${level} certificate to Cloudinary...`);
          const certificateResult = await cloudinary.uploader.upload(certificateFile.path, {
            folder: `education_documents/${userId}/${level.toLowerCase()}`,
            resource_type: 'auto'
          });
          documents.degreeCertificate = certificateResult.secure_url;
          console.log(`${level} certificate uploaded successfully`);
        }

        // Add education entry with documents
        const educationEntry = {
          ...education,
          level: level,
          documents: documents
        };
        console.log(`Created education entry for ${level}:`, educationEntry);

        // Find existing education with same level
        const existingIndex = educationInfo.educations.findIndex(
          e => e.level === level
        );

        if (existingIndex !== -1) {
          // Update existing education
          educationInfo.educations[existingIndex] = educationEntry;
          console.log(`Updated existing ${level} education entry`);
        } else {
          // Add new education
          educationInfo.educations.push(educationEntry);
          console.log(`Added new ${level} education entry`);
        }
      } catch (error) {
        console.error(`Error processing ${level} education:`, error);
        return res.status(400).json({
          success: false,
          message: `Error processing ${level} education`,
          error: error.message
        });
      }
    }

    // Save the updated education info
    console.log('Saving education info to database...');
    await educationInfo.save();
    console.log('Education info saved successfully');

    // Update user's form progress
    console.log('Updating user form progress...');
    await User.findByIdAndUpdate(userId, {
      formProgress: 'education_completed'
    });
    console.log('User form progress updated successfully');

    res.status(201).json({
      success: true,
      message: 'Education information added successfully',
      data: educationInfo
    });

  } catch (error) {
    console.error('Error in addEducation:', error);
    res.status(400).json({
      success: false,
      message: 'Error adding education information',
      error: error.message
    });
  }
};

exports.getEducationInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const educationInfo = await EducationInfo.findOne({ userId });
    if (!educationInfo) {
      return res.status(404).json({
        success: false,
        message: 'Education information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: educationInfo
    });
  } catch (error) {
    console.error('Error in getEducationInfo:', error);
    res.status(400).json({
      success: false,
      message: 'Error retrieving education information',
      error: error.message
    });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { educationData } = req.body;

    let educationInfo = await EducationInfo.findOne({ userId });
    if (!educationInfo) {
      return res.status(404).json({
        success: false,
        message: 'Education information not found'
      });
    }

    // Parse educationData if it's a string
    let parsedEducationData;
    try {
      if (typeof educationData === 'string') {
        // Clean the string before parsing
        const cleanedData = educationData.trim().replace(/}\s*]}\s*$/, '}]');
        parsedEducationData = JSON.parse(cleanedData);
      } else {
        parsedEducationData = educationData;
      }

      // Ensure it's an array
      if (!Array.isArray(parsedEducationData)) {
        parsedEducationData = [parsedEducationData];
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid educationData format',
        error: error.message
      });
    }

    // Process each education level
    for (const education of parsedEducationData) {
      const documents = {};
      const level = education.level.toUpperCase();
      console.log(`Processing education level: ${level}`);
      
      // Handle files based on education level
      if (req.files) {
        if (['SSC', 'HSC'].includes(level)) {
          const prefix = level.toLowerCase() + '_';
          const leavingCertFile = req.files[prefix + 'leavingCertificate']?.[0];
          console.log(`${level} - Looking for file: ${prefix}leavingCertificate`, leavingCertFile ? 'Found' : 'Not found');
          if (leavingCertFile) {
            console.log(`Uploading ${level} leaving certificate to Cloudinary...`);
            const result = await cloudinary.uploader.upload(leavingCertFile.path, {
              folder: `education_documents/${userId}/${level.toLowerCase()}`,
              resource_type: 'auto'
            });
            documents.leavingCertificate = result.secure_url;
            console.log(`${level} leaving certificate uploaded successfully`);
          }
        } else if (['DIPLOMA', 'DEGREE', 'MASTER'].includes(level)) {
          const prefix = level.toLowerCase() + '_';
          
          const marksheetFile = req.files[prefix + 'marksheet']?.[0];
          console.log(`${level} - Looking for file: ${prefix}marksheet`, marksheetFile ? 'Found' : 'Not found');
          if (marksheetFile) {
            console.log(`Uploading ${level} marksheet to Cloudinary...`);
            const result = await cloudinary.uploader.upload(marksheetFile.path, {
              folder: `education_documents/${userId}/${level.toLowerCase()}`,
              resource_type: 'auto'
            });
            documents.marksheet = result.secure_url;
            console.log(`${level} marksheet uploaded successfully`);
          }

          const certificateFile = req.files[prefix + 'certificate']?.[0];
          console.log(`${level} - Looking for file: ${prefix}certificate`, certificateFile ? 'Found' : 'Not found');
          if (certificateFile) {
            console.log(`Uploading ${level} certificate to Cloudinary...`);
            const result = await cloudinary.uploader.upload(certificateFile.path, {
              folder: `education_documents/${userId}/${level.toLowerCase()}`,
              resource_type: 'auto'
            });
            documents.degreeCertificate = result.secure_url;
            console.log(`${level} certificate uploaded successfully`);
          }
        }
      }

      const educationEntry = {
        ...education,
        level: level,
        documents: {
          ...education.documents,
          ...documents
        }
      };
      console.log(`Updated education entry for ${level}:`, educationEntry);

      const existingIndex = educationInfo.educations.findIndex(
        e => e.level === level
      );

      if (existingIndex !== -1) {
        educationInfo.educations[existingIndex] = educationEntry;
        console.log(`Updated existing ${level} education entry`);
      } else {
        educationInfo.educations.push(educationEntry);
        console.log(`Added new ${level} education entry`);
      }
    }

    console.log('Saving education info to database...');
    await educationInfo.save();
    console.log('Education info saved successfully');

    res.status(200).json({
      success: true,
      message: 'Education information updated successfully',
      data: educationInfo
    });
  } catch (error) {
    console.error('Error in updateEducation:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating education information',
      error: error.message
    });
  }
};
