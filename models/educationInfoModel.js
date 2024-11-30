const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['SSC', 'HSC', 'DIPLOMA', 'DEGREE', 'MASTER'],
    required: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return ['SSC', 'HSC', 'DIPLOMA', 'DEGREE', 'MASTER'].includes(v);
      },
      message: props => `${props.value} is not a valid education level`
    }
  },
  schoolName: { 
    type: String,
    required: function() {
      return ['SSC', 'HSC'].includes(this.level);
    }
  },
  collegeName: { 
    type: String,
    required: function() {
      return ['DIPLOMA', 'DEGREE', 'MASTER'].includes(this.level);
    }
  },
  fieldOfStudy: { 
    type: String,
    enum: ['Science', 'Commerce', 'Arts'],
    required: function() {
      return this.level === 'HSC';
    }
  },
  degreeName: { 
    type: String,
    required: function() {
      return ['DIPLOMA', 'DEGREE', 'MASTER'].includes(this.level);
    }
  },
  passingYear: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return v >= 1900 && v <= new Date().getFullYear();
      },
      message: props => `${props.value} is not a valid passing year!`
    }
  },
  percentage: { 
    type: Number,
    required: function() {
      return ['SSC', 'HSC', 'DIPLOMA'].includes(this.level);
    },
    min: 0,
    max: 100
  },
  cgpa: { 
    type: Number,
    required: function() {
      return ['DEGREE', 'MASTER'].includes(this.level);
    },
    min: 0,
    max: 10
  },
  location: { 
    type: String, 
    required: true 
  },
  documents: {
    leavingCertificate: { 
      type: String,
      required: function() {
        return ['SSC', 'HSC'].includes(this.parent().level);
      }
    },
    marksheet: { 
      type: String,
      required: function() {
        return ['DIPLOMA', 'DEGREE', 'MASTER'].includes(this.parent().level);
      }
    },
    degreeCertificate: { 
      type: String,
      required: function() {
        return ['DIPLOMA', 'DEGREE', 'MASTER'].includes(this.parent().level);
      }
    }
  }
});

const educationInfoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  educations: [educationSchema],
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
    await mongoose.connection.collection('educationinfos').dropIndex('educations.userId_1_educations.level_1');
    console.log('Successfully dropped the problematic index');
  } catch (error) {
    console.log('Index might not exist, continuing...');
  }
};

dropIndex();

// Create a unique compound index on userId only
educationInfoSchema.index({ userId: 1 }, { unique: true });

// Add validation to ensure unique education levels within the array
educationInfoSchema.pre('save', function(next) {
  const levels = new Set();
  for (const education of this.educations) {
    if (levels.has(education.level)) {
      next(new Error(`Duplicate education level found: ${education.level}`));
      return;
    }
    levels.add(education.level);
  }
  next();
});

// Custom validation middleware
educationSchema.pre('save', function(next) {
  const education = this;
  
  try {
    switch(education.level) {
      case 'SSC':
      case 'HSC':
        if (!education.schoolName) {
          throw new Error(`${education.level} requires schoolName`);
        }
        if (!education.percentage) {
          throw new Error(`${education.level} requires percentage`);
        }
        if (!education.documents.leavingCertificate) {
          throw new Error(`${education.level} requires leavingCertificate`);
        }
        if (education.level === 'HSC' && !education.fieldOfStudy) {
          throw new Error('HSC requires fieldOfStudy');
        }
        break;

      case 'DIPLOMA':
      case 'DEGREE':
      case 'MASTER':
        if (!education.collegeName) {
          throw new Error(`${education.level} requires collegeName`);
        }
        if (!education.degreeName) {
          throw new Error(`${education.level} requires degreeName`);
        }
        if (education.level === 'DEGREE' || education.level === 'MASTER') {
          if (!education.cgpa) {
            throw new Error(`${education.level} requires cgpa`);
          }
        } else if (!education.percentage) {
          throw new Error(`${education.level} requires percentage`);
        }
        if (!education.documents.marksheet || !education.documents.degreeCertificate) {
          throw new Error(`${education.level} requires both marksheet and degreeCertificate`);
        }
        break;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const EducationInfo = mongoose.model('EducationInfo', educationInfoSchema);

module.exports = EducationInfo;
