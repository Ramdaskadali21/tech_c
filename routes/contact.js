const express = require('express');
const router = express.Router();

// @route   POST /api/contact
// @desc    Send a contact message
// @access  Public
router.post('/', (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please enter all fields' });
  }

  // In a real application, you would send an email here or save to a database
  console.log(`New contact message from ${name} (${email}): ${message}`);

  res.status(200).json({ success: true, message: 'Message sent successfully!' });
});

module.exports = router;

