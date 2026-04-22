const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['milk', 'ghee', 'paneer', 'butter', 'curd', 'lassi', 'sweets', 'other']
  },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '🥛' },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviews: [{
    user: String,
    comment: String,
    rating: Number,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
