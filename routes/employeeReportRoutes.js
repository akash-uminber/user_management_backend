const express = require('express');
const router = express.Router();
const employeeReportController = require('../controllers/employeeReportController');
const authMiddleware = require('../middleware/auth');

// Routes for employee status reports
router.get('/current', authMiddleware, employeeReportController.getCurrentMonthReport);
router.get('/monthly', authMiddleware, employeeReportController.getMonthlyReport);
router.get('/yearly', authMiddleware, employeeReportController.getYearlyReport);

module.exports = router;
