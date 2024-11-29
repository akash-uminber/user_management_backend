const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const routes = require('./routes');
const connectDB = require('./db');
const authController = require('./controllers/authController');
const path = require('path');
const documentationRoutes = require('./routes/documentationRoutes');
const legalComplianceRoutes = require('./routes/legalComplianceRoutes');
const userHistoryRoutes = require('./routes/userHistoryRoutes');

const app = express();

// Add these lines after your express app initialization
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB()
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Test route directly in server.js
app.get('/test', (req, res) => {
  res.json({ message: 'Direct route works' });
});

// Add this route for testing file upload
app.get('/test-upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Register route directly in server.js
app.post('/api/register', authController.register);

// Mount other routes
app.use('/api', routes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/legal-compliance', legalComplianceRoutes);
app.use('/api/user-history', userHistoryRoutes);
console.log('🛣️  Routes mounted at /api');

// 404 handler
app.use((req, res, next) => {
  console.log(`❌ 404 - Cannot ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`📝 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/test`);
  console.log(`   POST http://localhost:${PORT}/api/register`);
  console.log(`   GET  http://localhost:${PORT}/test-upload`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise rejection:', err);
  // Don't exit the process, just log the error
});
