const multer = require('multer');
const path = require('path');

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Define allowed education levels and their document fields
const EDUCATION_LEVELS = {
  ssc: {
    certificate: 'ssc_leavingCertificate'
  },
  hsc: {
    certificate: 'hsc_leavingCertificate'
  },
  diploma: {
    certificate: 'diploma_certificate',
    marksheet: 'diploma_marksheet'
  },
  degree: {
    certificate: 'degree_certificate',
    marksheet: 'degree_marksheet'
  },
  master: {
    certificate: 'master_certificate',
    marksheet: 'master_marksheet'
  }
};

// Define work experience document fields
const WORK_FIELDS = {
  experienceLetter: 'experienceLetter'
};

// Create array of all possible file fields
const FILE_FIELDS = [
  ...Object.values(EDUCATION_LEVELS)
    .flatMap(level => Object.values(level))
    .map(fieldName => ({ name: fieldName, maxCount: 1 })),
  ...Object.values(WORK_FIELDS)
    .map(fieldName => ({ name: fieldName, maxCount: 1 }))
];

// Basic storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📂 Destination called for file:', {
      fieldname: file.fieldname,
      originalname: file.originalname
    });
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    console.log('📝 Filename called for file:', {
      fieldname: file.fieldname,
      originalname: file.originalname
    });
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 FileFilter called for:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });

    // Allow PDF, DOC, DOCX files
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
}).fields(FILE_FIELDS);

// Export middleware
module.exports = (req, res, next) => {
  console.log('\n🚀 Starting file upload process');
  console.log('📨 Request headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
        code: err.code
      });
    } else if (err) {
      console.error('❌ Unknown error:', err);
      return res.status(500).json({
        success: false,
        message: `Server error: ${err.message}`
      });
    }

    console.log('📦 Upload complete. Request data:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : []
    });

    next();
  });
};
