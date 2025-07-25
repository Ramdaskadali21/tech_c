const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all published posts with pagination and filtering
// @access  Public
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('sort')
    .optional()
    .isIn(['latest', 'oldest', 'popular', 'trending'])
    .withMessage('Sort must be one of: latest, oldest, popular, trending')
], optionalAuth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, tags, search, sort = 'latest' } = req.query;

    // Build query
    let query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { publishedAt: 1 };
        break;
      case 'popular':
        sortQuery = { views: -1, likes: -1 };
        break;
      case 'trending':
        // Posts from last 7 days sorted by views and likes
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.publishedAt = { $gte: oneWeekAgo };
        sortQuery = { views: -1, likes: -1 };
        break;
      case 'latest':
      default:
        sortQuery = { publishedAt: -1 };
        break;
    }

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'firstName lastName username avatar')
      .populate('category', 'name slug color')
      .select('-content') // Exclude full content for list view
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/trending
// @desc    Get trending posts
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await Post.findTrending(limit);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending posts'
    });
  }
});

// @route   GET /api/posts/tags
// @desc    Get all unique tags
// @access  Public
router.get('/tags', async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      success: true,
      data: { tags: tags.map(tag => ({ name: tag._id, count: tag.count })) }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags'
    });
  }
});

// @route   GET /api/posts/admin
// @desc    Get all posts for admin (including drafts)
// @access  Private (Admin)
router.get('/admin', [
  auth,
  adminAuth,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  query('sort')
    .optional()
    .isIn(['latest', 'oldest', 'title', 'views'])
    .withMessage('Sort must be one of: latest, oldest, title, views')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, sort = 'latest' } = req.query;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'title':
        sortQuery = { title: 1 };
        break;
      case 'views':
        sortQuery = { views: -1 };
        break;
      case 'latest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'firstName lastName username avatar')
      .populate('category', 'name slug color')
      .select('-content') // Exclude full content for list view
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get admin posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
    .populate('author', 'firstName lastName username avatar bio')
    .populate('category', 'name slug color description')
    .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views (but not for the author)
    if (!req.user || req.user._id.toString() !== post.author._id.toString()) {
      await post.incrementViews();
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private (Admin)
router.post('/', [
  auth,
  adminAuth,
  body('title')
    .notEmpty()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      status,
      featuredImage,
      seo,
      contentType,
      scheduledFor,
      affiliateLinks,
      adSenseEnabled,
      commentsEnabled
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Create new post
    const post = new Post({
      title,
      content,
      excerpt,
      category,
      tags: tags || [],
      author: req.user._id,
      status: status || 'draft',
      featuredImage: featuredImage || {},
      seo: seo || {},
      contentType: contentType || 'markdown',
      scheduledFor,
      affiliateLinks: affiliateLinks || [],
      adSenseEnabled: adSenseEnabled !== undefined ? adSenseEnabled : true,
      commentsEnabled: commentsEnabled !== undefined ? commentsEnabled : true
    });

    await post.save();

    // Populate the post before returning
    await post.populate('author', 'firstName lastName username avatar');
    await post.populate('category', 'name slug color');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Admin)
router.put('/:id', [
  auth,
  adminAuth,
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be one of: draft, published, archived'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Verify category exists if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Update post fields
    const updateFields = [
      'title', 'content', 'excerpt', 'category', 'tags', 'status',
      'featuredImage', 'seo', 'contentType', 'scheduledFor',
      'affiliateLinks', 'adSenseEnabled', 'commentsEnabled'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();

    // Populate the post before returning
    await post.populate('author', 'firstName lastName username avatar');
    await post.populate('category', 'name slug color');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Public
router.post('/:id/like', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.incrementLikes();

    res.json({
      success: true,
      message: 'Post liked successfully',
      data: { likes: post.likes + 1 }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
});

module.exports = router;

