const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  address: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    unit: String
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']
  },
  paymentMethod: { type: String, default: 'cash', enum: ['cash', 'online', 'upi'] },
  deliveryDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
