const mongoose = require('mongoose');

const legalComplianceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  internshipAgreement: { 
    type: String,
    required: true
  },
  nonDisclosureAgreement: { 
    type: String,
    required: true
  },
  workAuthorization: { 
    type: String,
    required: true
  },
  digitalSignature: { 
    type: String,
    required: true
  }
}, { timestamps: true });

const LegalCompliance = mongoose.model('LegalCompliance', legalComplianceSchema);

module.exports = LegalCompliance;
