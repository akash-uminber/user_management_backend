const multer = require('multer');
const path = require('path');

// Ensure documentation uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads/documentation')) {
  fs.mkdirSync('uploads/documentation', { recursive: true });
}

// Define document fields
const DOCUMENT_FIELDS = [
  { name: 'resume', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'guardianAadharCard', maxCount: 1 },
  { name: 'diplomaOrDegreeCertificate', maxCount: 1 },
  { name: 'lastSemMarksheet', maxCount: 1 },
  { name: 'sscMarksheet', maxCount: 1 },
  { name: 'hscMarksheet', maxCount: 1 },
  { name: 'passportSizePhoto', maxCount: 1 },
  { name: 'cancelledCheque', maxCount: 1 },
  { name: 'passbookFirstPage', maxCount: 1 },
  { name: 'medicalCertificate', maxCount: 1 }
];

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.userId;
    const userDir = path.join('uploads/documentation', userId);
    
    // Create user-specific directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Use document type as filename with timestamp and original extension
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${timestamp}${ext}`);
  }
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'resume': ['.pdf', '.doc', '.docx'],
    'passportSizePhoto': ['.jpg', '.jpeg', '.png'],
    'default': ['.pdf', '.jpg', '.jpeg', '.png']
  };
  
  const ext = path.extname(file.originalname).toLowerCase();
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

// Export middleware
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error (e.g., file too large)
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // Other errors (e.g., invalid file type)
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // No error, continue
    next();
  });
};
