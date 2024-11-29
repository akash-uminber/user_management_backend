// // models/User.js
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required']
//   },
//   otp: {
//     type: String
//   }
// });

// userSchema.post('save', function(doc) {
//   console.log('User has been saved:', doc);
// });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema for HR registration
const hrSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required']
    },
    DOB: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Gender is required']
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required']
    },
    otp: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Pre-save middleware
hrSchema.pre('save', function(next) {
    console.log('Pre-save HR data:', this.toObject());
    next();
});

// Post-save hooks for logging
hrSchema.post('save', function(doc) {
    console.log('Post-save HR data:', doc.toObject());
    console.log('HR has been saved:', doc);
});

// Keep existing user schema for login
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Only require password for HR users
      return this.role === 'hr';
    }
  },
  role: {
    type: String,
    enum: ['hr', 'employee', 'admin'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  formProgress: {
    type: String,
    enum: ['personal', 'education', 'experience', 'family', 'documents', 'completed'],
    default: 'personal'
  },
  otp: String,
  otpExpires: Date,
  tempToken: String
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Post-save hooks for logging
userSchema.post('save', function(doc) {
    console.log('User has been saved:', doc);
});

// Export both models
const User = mongoose.model('User', userSchema);
const HR = mongoose.model('HR', hrSchema);

module.exports = { User, HR };