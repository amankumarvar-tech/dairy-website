const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cowdairy')
  .then(() => {
    console.log('✅ MongoDB Connected to cowdairy database');
    seedDatabase();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Cow Dairy API Running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date()
  });
});

// Seed initial data
async function seedDatabase() {
  const Product = require('./models/Product');
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      { name: 'Fresh Full Cream Milk', category: 'milk', price: 60, unit: '1 Liter', description: 'Pure desi cow ka taaza full cream milk, bilkul fresh har subah', image: '🥛', inStock: true, featured: true, rating: 4.8 },
      { name: 'Toned Milk', category: 'milk', price: 50, unit: '1 Liter', description: 'Low fat healthy toned milk, diet ke liye best', image: '🍼', inStock: true, featured: false, rating: 4.5 },
      { name: 'Pure Desi Ghee', category: 'ghee', price: 650, unit: '500gm', description: 'Bilona method se bana 100% pure desi ghee, ghar jaisi khushboo', image: '🫙', inStock: true, featured: true, rating: 4.9 },
      { name: 'Fresh Paneer', category: 'paneer', price: 320, unit: '500gm', description: 'Taaze doodh se bana soft aur tasty paneer', image: '🧀', inStock: true, featured: true, rating: 4.7 },
      { name: 'Homemade Butter', category: 'butter', price: 280, unit: '500gm', description: 'Cream se bana fresh white butter, bilkul ghar jaisa', image: '🧈', inStock: true, featured: false, rating: 4.6 },
      { name: 'Dahi (Curd)', category: 'curd', price: 80, unit: '500gm', description: 'Thick creamy dahi, probiotic se bharpur', image: '🍦', inStock: true, featured: true, rating: 4.8 },
      { name: 'Lassi (Sweet)', category: 'lassi', price: 40, unit: '250ml', description: 'Meethi creamy lassi, summer ka best drink', image: '🥤', inStock: true, featured: false, rating: 4.7 },
      { name: 'Mawa (Khoya)', category: 'sweets', price: 400, unit: '500gm', description: 'Mithai banane ke liye best quality mawa', image: '🍮', inStock: true, featured: false, rating: 4.5 },
    ];
    await Product.insertMany(products);
    console.log('🌱 Database seeded with products!');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Docs: http://localhost:${PORT}/api/health`);
});
