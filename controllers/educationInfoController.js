const EducationInfo = require('../models/educationInfoModel');
const { User } = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.addEducation = async (req, res) => {
  console.log('Files in request:', req.files);
  
  try {
    const { userId, educationData } = req.body;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
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

    const educationEntries = JSON.parse(educationData);
    let userEducation = await EducationInfo.findOne({ userId });
    
    // If no document exists for this user, create one
    if (!userEducation) {
      userEducation = new EducationInfo({
        userId,
        educations: [],
        status: 'active'
      });
    }

    for (const education of educationEntries) {
      console.log(`Processing education level: ${education.level}`);
      
      // Find existing education entry index
      const existingIndex = userEducation.educations.findIndex(
        edu => edu.level === education.level
      );
      
      const documents = {};

      // Handle SSC and HSC documents
      if (education.level === 'SSC' || education.level === 'HSC') {
        const certificateField = `${education.level.toLowerCase()}_leavingCertificate`;
        
        if (req.files[certificateField]) {
          // Delete existing document from Cloudinary if it exists
          if (existingIndex !== -1 && userEducation.educations[existingIndex].documents?.leavingCertificate) {
            const publicId = userEducation.educations[existingIndex].documents.leavingCertificate.split('/').slice(-1)[0].split('.')[0];
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error(`Error deleting document from Cloudinary:`, error);
            }
          }

          console.log(`Uploading ${education.level} leaving certificate to Cloudinary...`);
          const result = await cloudinary.uploader.upload(req.files[certificateField][0].path, {
            folder: `education_documents/${userId}/${education.level.toLowerCase()}`,
            resource_type: 'auto'
          });
          documents.leavingCertificate = result.secure_url;
          
          // Delete local file
          fs.unlinkSync(req.files[certificateField][0].path);
        } else if (existingIndex !== -1 && userEducation.educations[existingIndex].documents?.leavingCertificate) {
          // Keep existing document if no new one is uploaded
          documents.leavingCertificate = userEducation.educations[existingIndex].documents.leavingCertificate;
        }
      } 
      // Handle DIPLOMA, DEGREE, and MASTER documents
      else if (['DIPLOMA', 'DEGREE', 'MASTER'].includes(education.level)) {
        const marksheetField = `${education.level.toLowerCase()}_marksheet`;
        const certificateField = `${education.level.toLowerCase()}_certificate`;
        
        if (req.files[marksheetField]) {
          // Delete existing marksheet from Cloudinary if it exists
          if (existingIndex !== -1 && userEducation.educations[existingIndex].documents?.marksheet) {
            const publicId = userEducation.educations[existingIndex].documents.marksheet.split('/').slice(-1)[0].split('.')[0];
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error(`Error deleting marksheet from Cloudinary:`, error);
            }
          }

          console.log(`Uploading ${education.level} marksheet to Cloudinary...`);
          const marksheetResult = await cloudinary.uploader.upload(req.files[marksheetField][0].path, {
            folder: `education_documents/${userId}/${education.level.toLowerCase()}`,
            resource_type: 'auto'
          });
          documents.marksheet = marksheetResult.secure_url;
          
          // Delete local file
          fs.unlinkSync(req.files[marksheetField][0].path);
        } else if (existingIndex !== -1 && userEducation.educations[existingIndex].documents?.marksheet) {
          // Keep existing marksheet if no new one is uploaded
          documents.marksheet = userEducation.educations[existingIndex].documents.marksheet;
        }

        if (req.files[certificateField]) {
          // Delete existing certificate from Cloudinary if it exists
          if (existingIndex !== -1 && userEducation.educations[existingIndex].documents?.degreeCertificate) {
            const publicId = userEducation.educations[existingIndex].documents.degreeCertificate.split('/').slice(-1)[0].split('.')[0];
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error(`Error deleting certificate from Cloudinary:`, error);
            }
          }

          console.log(`Uploading ${education.level} certificate to Cloudinary...`);
          const certificateResult = await cloudinary.uploader.upload(req.files[certificateField][0].path, {
            folder: `education_documents/${userId}/${education.level.toLowerCase()}`,
            resource_type: 'auto'
          });
          documents.degreeCertificate = certificateResult.secure_url;
          
          // Delete local file
          fs.unlinkSync(req.files[certificateField][0].path);
        } else if (existingIndex !== -1 && userEducation.educations[existingIndex].documents?.degreeCertificate) {
          // Keep existing certificate if no new one is uploaded
          documents.degreeCertificate = userEducation.educations[existingIndex].documents.degreeCertificate;
        }
      }

      const educationEntry = {
        ...education,
        documents
      };

      // Update or add education entry
      if (existingIndex !== -1) {
        userEducation.educations[existingIndex] = educationEntry;
      } else {
        userEducation.educations.push(educationEntry);
      }
    }

    // Save the updated document
    await userEducation.save();

    // Update user's form progress
    await User.findByIdAndUpdate(userId, {
      formProgress: 'documentation'
    });

    res.status(201).json({
      success: true,
      message: 'Education information saved successfully',
      data: userEducation
    });

  } catch (error) {
    console.error('Error in addEducation:', error);
    
    // Clean up any uploaded files if there's an error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Error saving education information'
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
