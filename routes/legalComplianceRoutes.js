const express = require('express');
const router = express.Router();
const legalComplianceController = require('../controllers/legalComplianceController');
const legalComplianceUpload = require('../middleware/legalComplianceUpload');

// Upload legal compliance documents
router.post('/', legalComplianceUpload, legalComplianceController.uploadDocuments);

// Get legal compliance documents
router.get('/:userId', legalComplianceController.getDocuments);

// Delete legal compliance documents
router.delete('/:userId', legalComplianceController.deleteDocuments);

module.exports = router;
