const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentationController');
const documentUpload = require('../middleware/documentUpload');

// Upload/Update documents
router.post('/', documentUpload, documentationController.uploadDocuments);

// Get documents by userId
router.get('/:userId', documentationController.getDocuments);

// Delete documents by userId
router.delete('/:userId', documentationController.deleteDocuments);

module.exports = router;
