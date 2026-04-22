const express  = require('express');
const router   = express.Router();
const Order    = require('../models/Order');

let paymentService, whatsappService;
try { paymentService = require('../services/payment'); } catch(e) { paymentService = null; }
try { whatsappService = require('../services/whatsapp'); } catch(e) { whatsappService = null; }

const wa = (fn) => async (...args) => {
  if (whatsappService) return whatsappService[fn](...args).catch(console.error);
};

// GET all orders
router.get('/', async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST place order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    if (whatsappService) {
      whatsappService.sendOrderConfirmation(order).catch(console.error);
      whatsappService.sendOwnerAlert(order).catch(console.error);
    }
    res.status(201).json({ success: true, data: order, message: 'Order place ho gaya! WhatsApp par confirmation aayega.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST create Razorpay payment
router.post('/:id/create-payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!paymentService) return res.status(500).json({ success: false, message: 'Payment service unavailable' });
    const rzpOrder = await paymentService.createRazorpayOrder(order.totalAmount, order._id);
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
    res.json({ success: true, razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: process.env.RAZORPAY_KEY_ID, customerName: order.customerName, customerPhone: order.customerPhone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST verify payment
router.post('/:id/verify-payment', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!paymentService) return res.status(500).json({ success: false, message: 'Payment service unavailable' });
    const isValid = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return res.status(400).json({ success: false, message: 'Payment verification failed!' });
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: 'paid', razorpayPaymentId, paidAt: new Date(), paymentMethod: 'online' }, { new: true });
    if (whatsappService) whatsappService.sendPaymentSuccess(order, razorpayPaymentId).catch(console.error);
    res.json({ success: true, message: 'Payment successful! WhatsApp confirmation bheja gaya.', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (whatsappService) whatsappService.sendStatusUpdate(order, req.body.status).catch(console.error);
    res.json({ success: true, data: order, message: 'Status update! Customer ko WhatsApp gaya.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST manual reminder
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!whatsappService) return res.status(500).json({ success: false, message: 'WhatsApp service unavailable' });
    const result = await whatsappService.sendPaymentReminder(order, 0);
    await Order.findByIdAndUpdate(req.params.id, { $push: { reminderHistory: { sentAt: new Date(), daysOverdue: 0, type: 'manual_reminder' } } });
    res.json({ success: result.success, message: result.success ? 'Reminder bhej diya!' : 'Reminder fail hua' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
