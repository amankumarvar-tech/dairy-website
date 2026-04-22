const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered!' });
    
    const user = new User(req.body);
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: 'Registration successful! Welcome to Cow Dairy! 🐄'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ success: false, message: 'Email ya password galat hai!' });
    
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email ya password galat hai!' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      message: `Welcome back, ${user.name}! 🐄`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all users (admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
