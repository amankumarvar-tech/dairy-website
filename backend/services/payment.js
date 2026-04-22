// =====================================================
// services/payment.js
// Razorpay Payment Gateway Integration
// =====================================================

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay Order ────────────────────────────
async function createRazorpayOrder(amount, orderId) {
  const options = {
    amount: amount * 100,           // paisa mein (₹1 = 100 paisa)
    currency: 'INR',
    receipt: `dairy_${orderId}`,
    notes: {
      dairy: 'Shree Gau Dairy',
      orderId: String(orderId),
    },
  };
  return await razorpay.orders.create(options);
}

// ── Verify Payment Signature ─────────────────────────
function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === razorpaySignature;
}

// ── Fetch Payment Details ────────────────────────────
async function getPaymentDetails(paymentId) {
  return await razorpay.payments.fetch(paymentId);
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
};
