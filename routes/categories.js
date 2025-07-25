const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Post = require('../models/Post');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all active categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findActive();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/with-counts
// @desc    Get all categories with post counts
// @access  Public
router.get('/with-counts', async (req, res) => {
  try {
    const categories = await Category.findWithPostCount();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories with counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/admin
// @desc    Get all categories for admin (including inactive)
// @access  Private (Admin)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ sortOrder: 1, name: 1 })
      .populate('subcategories');

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

// @route   GET /api/categories/:slug/posts
// @desc    Get posts in a category
// @access  Public
router.get('/:slug/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const posts = await Post.find({
      category: category._id,
      status: 'published'
    })
    .populate('author', 'firstName lastName username avatar')
    .populate('category', 'name slug color')
    .select('-content')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Post.countDocuments({
      category: category._id,
      status: 'published'
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        category,
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
    console.error('Get category posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category posts'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin)
router.post('/', [
  auth,
  adminAuth,
  body('name')
    .notEmpty()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category name is required and cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Parent category must be a valid ID'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
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

    const { name, description, color, icon, parentCategory, sortOrder, seo } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Verify parent category exists if provided
    if (parentCategory) {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Create new category
    const category = new Category({
      name,
      description: description || '',
      color: color || '#3B82F6',
      icon: icon || 'folder',
      parentCategory: parentCategory || null,
      sortOrder: sortOrder || 0,
      seo: seo || {}
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin)
router.put('/:id', [
  auth,
  adminAuth,
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Parent category must be a valid ID'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
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

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name already exists (if name is being changed)
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Verify parent category exists if provided
    if (req.body.parentCategory) {
      // Prevent circular reference
      if (req.body.parentCategory === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parentExists = await Category.findById(req.body.parentCategory);
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Update category fields
    const updateFields = [
      'name', 'description', 'color', 'icon', 'parentCategory',
      'isActive', 'sortOrder', 'seo'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has posts
    const postCount = await Post.countDocuments({ category: category._id });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${postCount} posts. Please move or delete the posts first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: category._id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategories. Please move or delete the subcategories first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
});

// @route   PUT /api/categories/:id/update-counts
// @desc    Update category post count and total views
// @access  Private (Admin)
router.put('/:id/update-counts', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.updatePostCount();
    await category.updateTotalViews();

    res.json({
      success: true,
      message: 'Category counts updated successfully',
      data: { 
        category: {
          id: category._id,
          name: category.name,
          postCount: category.postCount,
          totalViews: category.totalViews
        }
      }
    });
  } catch (error) {
    console.error('Update category counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category counts'
    });
  }
});

module.exports = router;

