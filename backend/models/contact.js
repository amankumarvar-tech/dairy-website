const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ 
      success: true, 
      message: 'Message mil gaya! Hum 24 ghante mein aapse contact karenge. 🐄',
      data: contact
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
