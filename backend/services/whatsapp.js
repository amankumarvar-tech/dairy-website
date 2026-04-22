// =====================================================
// routes/whatsapp.js
// WhatsApp test + manual trigger routes
// =====================================================

const express = require('express');
const router  = express.Router();
const { sendWhatsApp, sendDailySummary } = require('../services/whatsapp');
const Order = require('../models/Order');

// POST: Test WhatsApp — ek test message bhejo
router.post('/test', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number daal bhai!' });

    const result = await sendWhatsApp(phone,
`🐄 *Shree Gau Dairy*
━━━━━━━━━━━━━━━━━━
✅ WhatsApp integration working!

Ye test message hai Cow Dairy website se.
Sab kuch sahi chal raha hai! 🌿`
    );

    res.json({ success: result.success, message: result.success ? `Test message ${phone} par bheja!` : result.error });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Manual daily summary trigger (testing ke liye)
router.post('/daily-summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const pendingPayments = await Order.find({ paymentStatus: 'pending' });

    const stats = {
      newOrders: todayOrders.length,
      delivered: todayOrders.filter(o => o.status === 'delivered').length,
      pending: todayOrders.filter(o => o.status === 'pending').length,
      cancelled: todayOrders.filter(o => o.status === 'cancelled').length,
      todayRevenue: todayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0),
      totalDue: pendingPayments.reduce((s, o) => s + o.totalAmount, 0),
      paymentPending: pendingPayments.length,
    };

    const result = await sendDailySummary(stats);
    res.json({ success: result.success, message: 'Daily summary owner ko bheja!', stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Reminder history for an order
router.get('/reminders/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('customerName reminderHistory');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
