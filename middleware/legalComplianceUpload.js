const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configure Cloudinary
cloudinary.config(config.cloudinary);

// Verify Cloudinary configuration
console.log('Cloudinary Configuration Status:', {
  cloud_name: !!config.cloudinary.cloud_name,
  api_key: !!config.cloudinary.api_key,
  api_secret: !!config.cloudinary.api_secret
});

// Define document fields
const DOCUMENT_FIELDS = [
  { name: 'internshipAgreement', maxCount: 1 },
  { name: 'nonDisclosureAgreement', maxCount: 1 },
  { name: 'workAuthorization', maxCount: 1 },
  { name: 'digitalSignature', maxCount: 1 }
];

// Configure multer storage
const storage = multer.memoryStorage();

// File filter configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'digitalSignature': ['.jpg', '.jpeg', '.png'],
    'default': ['.pdf', '.doc', '.docx']
  };
  
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  const allowedExts = allowedTypes[file.fieldname] || allowedTypes.default;
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowedExts.join(', ')}`));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields(DOCUMENT_FIELDS);

// Function to get upload options based on file type
const getUploadOptions = (file, userId, fieldName) => {
  const uploadOptions = {
    folder: `legal_compliance/${userId}`,
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
    public_id: `${fieldName}_${Date.now()}`,
    use_filename: true,
    type: 'upload'
  };

  // Special handling for PDFs
  if (file.mimetype === 'application/pdf') {
    uploadOptions.format = 'pdf';
  }

  console.log('Upload options:', uploadOptions);
  return uploadOptions;
};

// Function to upload file to Cloudinary
const uploadToCloudinary = async (file, userId, fieldName) => {
  return new Promise((resolve, reject) => {
    // Verify Cloudinary configuration before upload
    if (!config.cloudinary.cloud_name || !config.cloudinary.api_key || !config.cloudinary.api_secret) {
      console.error('Missing Cloudinary configuration:', {
        cloud_name: !!config.cloudinary.cloud_name,
        api_key: !!config.cloudinary.api_key,
        api_secret: !!config.cloudinary.api_secret
      });
      reject(new Error('Cloudinary configuration is incomplete'));
      return;
    }

    const uploadOptions = getUploadOptions(file, userId, fieldName);

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload result:', result);
          
          let url = result.secure_url;
          
          // For PDFs, ensure proper delivery URL
          if (file.mimetype === 'application/pdf') {
            // Ensure HTTPS
            url = url.replace('http://', 'https://');
            
            // Add PDF specific transformation
            if (!url.includes('?')) {
              url += '?response-content-disposition=inline';
            }
          }
          
          resolve({ fieldName, url });
        }
      }
    );

    // Add error handler for the upload stream
    uploadStream.on('error', (error) => {
      console.error('Upload stream error:', error);
      reject(error);
    });

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = require('stream').Readable.from(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Middleware to handle file upload and Cloudinary upload
module.exports = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      console.error('File filter error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
      console.log('User ID:', req.body.userId);

      // If files were uploaded, process them through Cloudinary
      if (req.files) {
        const uploadPromises = [];
        
        for (const [fieldName, files] of Object.entries(req.files)) {
          const file = files[0];
          console.log(`Processing ${fieldName}:`, {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          
          uploadPromises.push(uploadToCloudinary(file, req.body.userId, fieldName));
        }

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);
        console.log('Upload results:', uploadResults);
        
        // Add Cloudinary URLs to the request object
        req.cloudinaryUrls = {};
        uploadResults.forEach(({ fieldName, url }) => {
          req.cloudinaryUrls[fieldName] = url;
        });

        console.log('Cloudinary URLs:', req.cloudinaryUrls);
      }

      next();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading to Cloudinary',
        error: error.message,
        details: error.stack
      });
    }
  });
};
