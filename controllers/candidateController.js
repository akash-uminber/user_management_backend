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

exports.searchCandidates = async (req, res) => {
  try {
    const { searchType, query } = req.query;
    let results;

    switch (searchType) {
      case 'education':
        results = await EducationInfo.find({ 'educations.degreeName': new RegExp(query, 'i') }).populate('user', 'email');
        break;
      case 'work':
        results = await WorkInfo.find({ 'workExperiences.companyName': new RegExp(query, 'i') }).populate('user', 'email');
        break;
      case 'document':
        results = await Documentation.find({ $or: [
          { resume: new RegExp(query, 'i') },
          { idProof: new RegExp(query, 'i') },
          // Add other document fields here
        ]}).populate('user', 'email');
        break;
      case 'personal':
        results = await PersonalInfo.find({ 
          $or: [
            { fullName: new RegExp(query, 'i') },
            { email: new RegExp(query, 'i') },
            // Add other personal info fields here
          ]
        }).populate('user', 'email');
        break;
      default:
        return res.status(400).json({ message: 'Invalid search type' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error searching candidates:', error);
    res.status(500).json({ message: 'Error searching candidates', error: error.message });
  }
};

exports.getSpecificInfo = async (req, res) => {
  try {
    const { infoType, userId } = req.params;
    let result;

    switch (infoType) {
      case 'personal':
        result = await PersonalInfo.findOne({ user: userId });
        break;
      case 'education':
        result = await EducationInfo.findOne({ user: userId });
        break;
      case 'work':
        result = await WorkInfo.findOne({ user: userId });
        break;
      case 'currentWork':
        result = await CurrentWorkInfo.findOne({ user: userId });
        break;
      case 'documentation':
        result = await Documentation.findOne({ user: userId });
        break;
      case 'legalCompliance':
        result = await LegalCompliance.findOne({ user: userId });
        break;
      default:
        return res.status(400).json({ message: 'Invalid info type' });
    }

    if (!result) {
      return res.status(404).json({ message: 'Information not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error retrieving specific info:', error);
    res.status(500).json({ message: 'Error retrieving specific info', error: error.message });
  }
};
