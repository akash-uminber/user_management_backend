const express = require("express");
const router = express.Router();
const exampleController = require("../controllers/exampleController");
const authController = require("../controllers/authController");
const otpController = require("../controllers/otpController");
const personalInfoController = require("../controllers/personalInfoController");
const educationInfoController = require("../controllers/educationInfoController");
const workInfoController = require("../controllers/workInfoController");
const currentWorkInfoController = require("../controllers/currentWorkInfoController");
const documentationController = require("../controllers/documentationController");
const authMiddleware = require("../middleware/auth");
const legalComplianceController = require("../controllers/legalComplianceController");
const candidateController = require("../controllers/candidateController");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// OTP routes (protected)
router.post("/generate-otp", authMiddleware, otpController.generateOTP);
router.post("/verify-otp", authMiddleware, otpController.verifyOTP);

// Protected routes (require both authentication and OTP verification)
router.get("/hello", authMiddleware, exampleController.getHello);

// Personal Information routes
router.post(
  "/personal-info",
  authMiddleware,
  personalInfoController.createPersonalInfo
);
router.get(
  "/personal-info",
  authMiddleware,
  personalInfoController.getPersonalInfo
);
router.put(
  "/personal-info",
  authMiddleware,
  personalInfoController.updatePersonalInfo
);

// Education Information routes
router.post("/education", authMiddleware, educationInfoController.addEducation);
router.get(
  "/education",
  authMiddleware,
  educationInfoController.getEducationInfo
);
router.put(
  "/education/:educationId",
  authMiddleware,
  educationInfoController.updateEducation
);
router.delete(
  "/education/:educationId",
  authMiddleware,
  educationInfoController.deleteEducation
);

// Work Information routes
router.post(
  "/work-experience",
  authMiddleware,
  workInfoController.addWorkExperience
);
router.get("/work-info", authMiddleware, workInfoController.getWorkInfo);
router.put(
  "/work-experience/:workExperienceId",
  authMiddleware,
  workInfoController.updateWorkExperience
);
router.delete(
  "/work-experience/:workExperienceId",
  authMiddleware,
  workInfoController.deleteWorkExperience
);

// Current Work Information routes
router.post(
  "/current-work-info",
  authMiddleware,
  currentWorkInfoController.createOrUpdateWorkInfo
);
router.get(
  "/current-work-info",
  authMiddleware,
  currentWorkInfoController.getWorkInfo
);
router.delete(
  "/current-work-info",
  authMiddleware,
  currentWorkInfoController.deleteWorkInfo
);

// Documentation routes
router.post(
  "/documentation",
  authMiddleware,
  documentationController.uploadDocuments
);
router.get(
  "/documentation",
  authMiddleware,
  documentationController.getDocuments
);
router.put(
  "/documentation/:documentType",
  authMiddleware,
  documentationController.updateDocument
);
router.delete(
  "/documentation",
  authMiddleware,
  documentationController.deleteDocuments
);

// Legal Compliance routes
router.post(
  "/legal-compliance",
  authMiddleware,
  legalComplianceController.uploadDocuments
);
router.get(
  "/legal-compliance",
  authMiddleware,
  legalComplianceController.getDocuments
);
router.put(
  "/legal-compliance/:documentType",
  authMiddleware,
  legalComplianceController.updateDocument
);
router.delete(
  "/legal-compliance",
  authMiddleware,
  legalComplianceController.deleteDocuments
);

// Candidate details route
router.get('/candidate/:candidateId', authMiddleware, candidateController.getCandidateDetails);

// Candidate search and specific info routes
router.get('/candidates/search', authMiddleware, candidateController.searchCandidates);
router.get('/candidate/:userId/:infoType', authMiddleware, candidateController.getSpecificInfo);

// Password reset routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Add more routes here

module.exports = router;
