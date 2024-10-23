const mongoose = require('mongoose');

const documentationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  resume: { type: String, required: true },
  idProof: { type: String, required: true },
  addressProof: { type: String, required: true },
  guardianAadharCard: { type: String, required: true },
  diplomaOrDegreeCertificate: { type: String, required: true },
  lastSemMarksheet: { type: String, required: true },
  sscMarksheet: { type: String, required: true },
  hscMarksheet: { type: String, required: true },
  passportSizePhoto: { type: String, required: true },
  cancelledCheque: { type: String, required: true },
  passbookFirstPage: { type: String, required: true },
  medicalCertificate: { type: String, required: true }
}, { timestamps: true });

const Documentation = mongoose.model('Documentation', documentationSchema);

module.exports = Documentation;
