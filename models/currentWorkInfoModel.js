const mongoose = require('mongoose');

// First, let's drop all problematic indexes if they exist
const dropIndexes = async () => {
  try {
    const collection = mongoose.connection.collection('currentworkinfos');
    await collection.dropIndex('user_1');
    await collection.dropIndex('userId_1');
    console.log('Successfully dropped problematic indexes');
  } catch (error) {
    console.log('Indexes might not exist, continuing...');
  }
};

// Execute after connection is established
mongoose.connection.once('connected', () => {
  dropIndexes();
});

const currentWorkInfoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  employeeId: { 
    type: String, 
    required: true
  },
  workMailId: { 
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
  manager: { 
    type: String, 
    required: true 
  },
  teamLeader: { 
    type: String, 
    required: true 
  },
  reportingTo: { 
    type: String, 
    required: true 
  },
  workSchedule: { 
    type: String, 
    required: true 
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
    validate: {
      validator: function(v) {
        return !v || v >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: { 
    type: String, 
    enum: ['active', 'resigned', 'suspended', 'terminated'], 
    default: 'active' 
  }
}, { 
  timestamps: true,
  strict: true
});

// Wait for indexes to be dropped before creating new ones
mongoose.connection.once('connected', async () => {
  // Small delay to ensure indexes are dropped
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create new indexes
  currentWorkInfoSchema.index({ userId: 1 }, { 
    unique: true,
    sparse: true,
    background: true 
  });
  
  currentWorkInfoSchema.index({ employeeId: 1 }, { 
    unique: true,
    sparse: true,
    background: true 
  });
  
  currentWorkInfoSchema.index({ workMailId: 1 }, { 
    unique: true,
    sparse: true,
    background: true 
  });
});

const CurrentWorkInfo = mongoose.model('CurrentWorkInfo', currentWorkInfoSchema);

module.exports = CurrentWorkInfo;
