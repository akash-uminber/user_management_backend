const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherFullName: { type: String, required: true },
  motherFullName: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  currentAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  emergencyContactPerson: { type: String, required: true },
  emergencyContactRelation: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  maritalStatus: { type: String, required: true, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
  hobbies: [{ type: String }],
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const PersonalInfo = mongoose.model('PersonalInfo', personalInfoSchema);

module.exports = PersonalInfo;
