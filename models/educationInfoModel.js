const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['SSC', 'HSC', 'Diploma', 'Degree', 'Other'],
    required: true
  },
  collegeName: { type: String, required: true },
  degreeName: { type: String, required: true },
  passingYear: { type: Number, required: true },
  percentage: { type: Number, required: true },
  collegeLocation: { type: String, required: true },
  marksheet: { type: String, required: true }, // This will store the file path or URL
  certificate: { type: String, required: true } // This will store the file path or URL
});

const educationInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  educations: [educationSchema]
}, { timestamps: true });

const EducationInfo = mongoose.model('EducationInfo', educationInfoSchema);

module.exports = EducationInfo;
