const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();

// @route   GET /api/comments/:postId
// @desc    Get all approved comments for a post
// @access  Public
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      postId: req.params.postId, 
      isApproved: true 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/comments
// @desc    Add a new comment
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { postId, author, email, content, parentId } = req.body;

    // Basic validation
    if (!postId || !author || !email || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const newComment = new Comment({
      postId,
      author,
      email,
      content,
      parentId: parentId || null,
      isApproved: false // Comments need approval by default
    });

    const savedComment = await newComment.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Comment submitted for approval',
      data: savedComment 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/comments/:id/approve
// @desc    Approve a comment (admin only)
// @access  Private
router.put('/:id/approve', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.json({ success: true, data: comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

