const express = require('express');
const router = express.Router();
const userHistoryController = require('../controllers/userHistoryController');
const auth = require('../middleware/auth');

// Get all users' history
router.get('/', auth, userHistoryController.getUserHistory);

// Get specific user's history
router.get('/:userId', auth, userHistoryController.getUserHistoryById);

module.exports = router;
