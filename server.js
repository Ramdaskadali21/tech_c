const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// 🔐 Security middleware
app.use(helmet());

// ⏱ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ✅ CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

// 📦 Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📝 Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 📁 Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🌐 MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/comments', require('./routes/comments'));

// 🩺 Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tech Blog API is running',
    timestamp: new Date().toISOString()
  });
});

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// 🛑 Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message
  });
});

// 🚀 Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: ${process.env.NODE_ENV === 'production'
    ? 'https://tech-first.onrender.com/api'
    : `http://localhost:${PORT}/api`}`);
});
