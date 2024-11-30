const mongoose = require('mongoose');

// First, let's drop all problematic indexes if they exist
const dropIndexes = async () => {
  try {
    const collection = mongoose.connection.collection('legalcompliances');
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

const legalComplianceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  internshipAgreement: { 
    type: String,
    required: true
  },
  nonDisclosureAgreement: { 
    type: String,
    required: true
  },
  workAuthorization: { 
    type: String,
    required: true
  },
  digitalSignature: { 
    type: String,
    required: true
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
  
  // Create new index
  legalComplianceSchema.index({ userId: 1 }, { 
    unique: true,
    sparse: true,
    background: true 
  });
});

const LegalCompliance = mongoose.model('LegalCompliance', legalComplianceSchema);

module.exports = LegalCompliance;
