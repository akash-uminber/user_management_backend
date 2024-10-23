const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  location: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  managerName: { type: String, required: true },
  salary: { type: Number, required: true },
  workExperience: { type: String, required: true }, // You might want to consider using a Number for years/months
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  experienceLetter: { type: String, required: true } // This will store the file path or URL
});

const workInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  workExperiences: [workExperienceSchema]
}, { timestamps: true });

const WorkInfo = mongoose.model('WorkInfo', workInfoSchema);

module.exports = WorkInfo;
