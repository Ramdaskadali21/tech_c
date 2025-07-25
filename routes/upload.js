const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const postsDir = path.join(uploadsDir, 'posts');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, postsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    
    if (req.route.path.includes('/post')) {
      uploadPath = postsDir;
    } else if (req.route.path.includes('/avatar')) {
      uploadPath = avatarsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: imageFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name.'
      });
    }
  }
  
  if (err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// @route   POST /api/upload/post-image
// @desc    Upload image for blog post
// @access  Private (Admin)
router.post('/post-image', auth, adminAuth, upload.single('image'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/posts/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
      }
    });
  } catch (error) {
    console.error('Upload post image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// @route   POST /api/upload/post-images
// @desc    Upload multiple images for blog post
// @access  Private (Admin)
router.post('/post-images', auth, adminAuth, upload.array('images', 5), handleMulterError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => {
      const imageUrl = `/uploads/posts/${file.filename}`;
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: imageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${imageUrl}`
      };
    });
    
    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: { images: uploadedImages }
    });
  } catch (error) {
    console.error('Upload post images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during images upload'
    });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Update user's avatar in database
    req.user.avatar = avatarUrl;
    req.user.save();
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: avatarUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${avatarUrl}`
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar upload'
    });
  }
});

// @route   DELETE /api/upload/:type/:filename
// @desc    Delete uploaded file
// @access  Private (Admin)
router.delete('/:type/:filename', auth, adminAuth, (req, res) => {
  try {
    const { type, filename } = req.params;
    
    // Validate type
    const allowedTypes = ['posts', 'avatars'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }
    
    // Construct file path
    const filePath = path.join(uploadsDir, type, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file deletion'
    });
  }
});

// @route   GET /api/upload/files/:type
// @desc    Get list of uploaded files
// @access  Private (Admin)
router.get('/files/:type', auth, adminAuth, (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Validate type
    const allowedTypes = ['posts', 'avatars'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }
    
    const dirPath = path.join(uploadsDir, type);
    
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      return res.json({
        success: true,
        data: {
          files: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalFiles: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit
          }
        }
      });
    }
    
    // Read directory
    const files = fs.readdirSync(dirPath)
      .filter(file => {
        const filePath = path.join(dirPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          url: `/uploads/${type}/${file}`,
          fullUrl: `${req.protocol}://${req.get('host')}/uploads/${type}/${file}`
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = files.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedFiles = files.slice(skip, skip + limit);
    
    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          currentPage: page,
          totalPages,
          totalFiles: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching files'
    });
  }
});

module.exports = router;

