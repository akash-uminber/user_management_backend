const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configure Cloudinary
cloudinary.config(config.cloudinary);

// Configure multer storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
}).single('photo');

// Function to upload to Cloudinary
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'hr_photos',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        const bufferStream = require('stream').Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
    });
};

// Middleware to handle photo upload
module.exports = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            // If a file was uploaded, process it
            if (req.file) {
                const photoUrl = await uploadToCloudinary(req.file);
                req.photoUrl = photoUrl;
            }
            next();
        } catch (error) {
            console.error('Photo upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading photo',
                error: error.message
            });
        }
    });
};
