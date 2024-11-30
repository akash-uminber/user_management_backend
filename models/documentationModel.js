const mongoose = require('mongoose');

// First, let's drop all problematic indexes if they exist
const dropIndexes = async () => {
  try {
    const collection = mongoose.connection.collection('documentations');
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

const documentationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  resume: { 
    type: String, 
    required: true 
  },
  idProof: { 
    type: String, 
    required: true 
  },
  addressProof: { 
    type: String, 
    required: true 
  },
  guardianAadharCard: { 
    type: String, 
    required: true 
  },
  diplomaOrDegreeCertificate: { 
    type: String, 
    required: true 
  },
  lastSemMarksheet: { 
    type: String, 
    required: true 
  },
  sscMarksheet: { 
    type: String, 
    required: true 
  },
  hscMarksheet: { 
    type: String, 
    required: true 
  },
  passportSizePhoto: { 
    type: String, 
    required: true 
  },
  cancelledCheque: { 
    type: String, 
    required: true 
  },
  passbookFirstPage: { 
    type: String, 
    required: true 
  },
  medicalCertificate: { 
    type: String, 
    required: true 
  },
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

// Wait for indexes to be dropped before creating new ones
mongoose.connection.once('connected', async () => {
  // Small delay to ensure indexes are dropped
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create new index
  documentationSchema.index({ userId: 1 }, { 
    unique: true,
    sparse: true,
    background: true 
  });
});

const Documentation = mongoose.model('Documentation', documentationSchema);

module.exports = Documentation;
