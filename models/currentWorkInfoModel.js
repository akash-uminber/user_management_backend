const mongoose = require('mongoose');

const currentWorkInfoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  workMailId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  manager: { type: String, required: true },
  teamLeader: { type: String, required: true },
  reportingTo: { type: String, required: true },
  workSchedule: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date } // This can be null if it's an ongoing job
}, { timestamps: true });

const CurrentWorkInfo = mongoose.model('CurrentWorkInfo', currentWorkInfoSchema);

module.exports = CurrentWorkInfo;
