const express = require('express');
const router = express.Router();
const userStatusController = require('../controllers/userStatusController');
const auth = require('../middleware/auth');

// Status change routes
router.post('/resign', auth, userStatusController.resignUser);
router.post('/suspend', auth, userStatusController.suspendUser);
router.post('/terminate', auth, userStatusController.terminateUser);
router.post('/resume', auth, userStatusController.resumeUser);

// Get status information
router.get('/:workEmail', auth, userStatusController.getUserStatus);

module.exports = router;
