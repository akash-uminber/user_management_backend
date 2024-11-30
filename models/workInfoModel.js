const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  designation: { 
    type: String, 
    required: true 
  },
  managerName: { 
    type: String, 
    required: true 
  },
  salary: { 
    type: Number, 
    required: true,
    min: 0
  },
  workExperience: { 
    type: Number, 
    required: true,
    min: 0
  },
  startDate: { 
    type: Date, 
    required: true
  },
  endDate: { 
    type: Date,
    required: true
  },
  experienceLetter: { 
    type: String
  }
});

const workInfoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  workExperiences: [workExperienceSchema],
  status: { 
    type: String, 
    enum: ['active', 'resigned', 'suspended', 'terminated'], 
    default: 'active' 
  },
  suspensionDetails: {
    fromDate: Date,
    toDate: Date,
    reason: String
  }
}, { 
  timestamps: true,
  strict: true 
});

// First, let's drop the problematic index if it exists
const dropIndex = async () => {
  try {
    await mongoose.connection.collection('workinfos').dropIndex('user_1');
    console.log('Successfully dropped the problematic index');
  } catch (error) {
    console.log('Index might not exist, continuing...');
  }
};

dropIndex();

// Create a unique index on userId
workInfoSchema.index({ userId: 1 }, { unique: true });

// Add validation to ensure valid dates
workInfoSchema.path('workExperiences').validate(function(experiences) {
  if (!experiences || experiences.length === 0) return true;
  
  for (const exp of experiences) {
    const startDate = new Date(exp.startDate);
    const endDate = new Date(exp.endDate);
    const now = new Date();

    if (startDate > now) {
      throw new Error('Start date cannot be in the future');
    }
    if (endDate > now) {
      throw new Error('End date cannot be in the future');
    }
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
  }
  return true;
});

const WorkInfo = mongoose.model('WorkInfo', workInfoSchema);

module.exports = WorkInfo;
