const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const photoUpload = require('../middleware/photoUpload');

const authController = require('../controllers/authController');
const personalInfoController = require('../controllers/personalInfoController');
const educationInfoController = require('../controllers/educationInfoController');
const workInfoController = require('../controllers/workInfoController');
const currentWorkInfoController = require('../controllers/currentWorkInfoController');

// Debug route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Router is working' });
});

// Auth routes
router.post('/login', authController.login);
router.post('/register', photoUpload, authController.register);
router.post('/verify-otp', authController.verifyOTP);

// Personal Information routes
router.post("/personal-info", personalInfoController.addPersonalInfo);
router.get("/personal-info/:userId", personalInfoController.getPersonalInfo);
router.put("/personal-info/:userId", personalInfoController.updatePersonalInfo);

// Education routes with file upload
router.post('/education', 
  (req, res, next) => {
    console.log('Incoming education request');
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
  upload,
  (req, res, next) => {
    console.log('After upload middleware');
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    next();
  },
  educationInfoController.addEducation
);
router.get('/education/:userId', educationInfoController.getEducationInfo);
router.put('/education/:userId/:educationId', upload, educationInfoController.updateEducation);

// Work Experience Routes
router.post('/work', upload, workInfoController.addWorkExperience);
router.get('/work/:userId', workInfoController.getWorkInfo);
router.put('/work/:userId', upload, workInfoController.updateWorkInfo);

// Current Work Info Routes
router.post('/current-work', upload, currentWorkInfoController.addCurrentWorkInfo);
router.get('/current-work/:userId', currentWorkInfoController.getCurrentWorkInfo);
router.put('/current-work/:userId', upload, currentWorkInfoController.updateCurrentWorkInfo);

module.exports = router;
