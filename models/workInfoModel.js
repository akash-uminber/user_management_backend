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
    min: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Work experience cannot be negative'
    }
  },
  startDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Start date cannot be in the future'
    }
  },
  endDate: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date() && v >= this.startDate;
      },
      message: 'End date must be after start date and cannot be in the future'
    }
  },
  experienceLetter: { 
    type: String, 
    required: true 
  }
});

const workInfoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  workExperiences: [workExperienceSchema]
}, { timestamps: true });

// Custom validation middleware
workExperienceSchema.pre('save', function(next) {
  const experience = this;
  
  try {
    // Basic validations
    if (!experience.companyName || !experience.location || !experience.department ||
        !experience.designation || !experience.managerName) {
      throw new Error('All fields are required');
    }

    // Salary validation
    if (experience.salary <= 0) {
      throw new Error('Salary must be greater than 0');
    }

    // Experience validation
    if (experience.workExperience < 0) {
      throw new Error('Work experience cannot be negative');
    }

    // Document validation
    if (!experience.experienceLetter) {
      throw new Error('Experience letter is required');
    }

    next();
  } catch (error) {
    next(error);
  }
});

const WorkInfo = mongoose.model('WorkInfo', workInfoSchema);

module.exports = WorkInfo;
