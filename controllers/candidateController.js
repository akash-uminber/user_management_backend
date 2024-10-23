const User = require('../models/userModel');
const PersonalInfo = require('../models/personalInfoModel');
const EducationInfo = require('../models/educationInfoModel');
const WorkInfo = require('../models/workInfoModel');
const CurrentWorkInfo = require('../models/currentWorkInfoModel');
const Documentation = require('../models/documentationModel');
const LegalCompliance = require('../models/legalComplianceModel');

exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const user = await User.findById(candidateId).select('-password -otpSecret');
    if (!user) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const personalInfo = await PersonalInfo.findOne({ user: candidateId });
    const educationInfo = await EducationInfo.findOne({ user: candidateId });
    const workInfo = await WorkInfo.findOne({ user: candidateId });
    const currentWorkInfo = await CurrentWorkInfo.findOne({ user: candidateId });
    const documentation = await Documentation.findOne({ user: candidateId });
    const legalCompliance = await LegalCompliance.findOne({ user: candidateId });

    const candidateDetails = {
      user,
      personalInfo,
      educationInfo,
      workInfo,
      currentWorkInfo,
      documentation,
      legalCompliance
    };

    res.json(candidateDetails);
  } catch (error) {
    console.error('Error retrieving candidate details:', error);
    res.status(500).json({ message: 'Error retrieving candidate details', error: error.message });
  }
};
