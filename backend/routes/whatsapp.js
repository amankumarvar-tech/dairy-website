// =====================================================
// services/whatsapp.js
// Twilio WhatsApp API se messages bhejne ka service
// =====================================================

const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

// ── Helper: number format karo ──────────────────────
function formatNumber(phone) {
  // Remove spaces, dashes, brackets
  let num = String(phone).replace(/[\s\-\(\)]/g, '');
  // Add India country code if missing
  if (!num.startsWith('+')) {
    num = num.startsWith('91') ? `+${num}` : `+91${num}`;
  }
  return `whatsapp:${num}`;
}

// ── Core send function ───────────────────────────────
async function sendWhatsApp(to, message) {
  try {
    const result = await client.messages.create({
      from: FROM,
      to: formatNumber(to),
      body: message,
    });
    console.log(`✅ WhatsApp sent to ${to} | SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error(`❌ WhatsApp failed to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════
// 1. ORDER CONFIRMATION — customer ko
// ══════════════════════════════════════════════════
async function sendOrderConfirmation(order) {
  const itemsList = order.items
    .map(i => `  • ${i.productName} × ${i.quantity} = ₹${i.price * i.quantity}`)
    .join('\n');

  const message =
`🐄 *Shree Gau Dairy*
━━━━━━━━━━━━━━━━━━━━
✅ *Order Confirm Ho Gaya!*

Namaste *${order.customerName}* ji! 🙏

Aapka order mil gaya. Details:

📦 *Order Items:*
${itemsList}

💰 *Kul Amount:* ₹${order.totalAmount}
💳 *Payment:* ${order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
📍 *Address:* ${order.address}

⏰ *Delivery:* Kal subah 7 baje tak

Koi sawaal ho toh call karein:
📞 +91 98765 43210

Shukriya! 🌿`;

  return sendWhatsApp(order.customerPhone, message);
}

// ══════════════════════════════════════════════════
// 2. PAYMENT REMINDER — pending orders ke liye
// ══════════════════════════════════════════════════
async function sendPaymentReminder(order, daysOverdue = 0) {
  let urgency = '';
  if (daysOverdue === 0) urgency = '🔔 *Aaj ki yaad dilai*';
  else if (daysOverdue === 1) urgency = '⚠️ *1 din se pending*';
  else if (daysOverdue <= 3) urgency = `⚠️ *${daysOverdue} din se pending*`;
  else urgency = `🚨 *${daysOverdue} din se pending — urgent!*`;

  const message =
`🐄 *Shree Gau Dairy*
━━━━━━━━━━━━━━━━━━━━
💳 *Payment Reminder*

Namaste *${order.customerName}* ji! 🙏

${urgency}

📋 *Order Details:*
  Order ID: #${String(order._id).slice(-6).toUpperCase()}
  Amount: ₹${order.totalAmount}
  Date: ${new Date(order.createdAt).toLocaleDateString('hi-IN')}

Kripya jald payment karein:
👉 UPI: dairy@upi
👉 Cash on delivery bhi ho sakti hai

📞 Koi problem ho toh: +91 98765 43210

Dhanyavaad! 🌿`;

  return sendWhatsApp(order.customerPhone, message);
}

// ══════════════════════════════════════════════════
// 3. ORDER STATUS UPDATE — customer ko
// ══════════════════════════════════════════════════
async function sendStatusUpdate(order, newStatus) {
  const statusMsg = {
    confirmed:  '✅ Aapka order *confirm* ho gaya! Hum tayaar kar rahe hain.',
    dispatched: '🚚 Aapka order *raste mein* hai! Jald pahunchega.',
    delivered:  '🎉 Aapka order *deliver* ho gaya! Kripya payment karein.',
    cancelled:  '❌ Aapka order *cancel* ho gaya. Kisi bhi problem ke liye call karein.',
  };

  const message =
`🐄 *Shree Gau Dairy*
━━━━━━━━━━━━━━━━━━━━
📦 *Order Update*

Namaste *${order.customerName}* ji!

${statusMsg[newStatus] || `Order status: ${newStatus}`}

Order ID: #${String(order._id).slice(-6).toUpperCase()}
Amount: ₹${order.totalAmount}

📞 Helpline: +91 98765 43210`;

  return sendWhatsApp(order.customerPhone, message);
}

// ══════════════════════════════════════════════════
// 4. NEW ORDER ALERT — owner ko
// ══════════════════════════════════════════════════
async function sendOwnerAlert(order) {
  const itemsList = order.items
    .map(i => `  • ${i.productName} × ${i.quantity}`)
    .join('\n');

  const message =
`🐄 *Shree Gau Dairy — New Order!*
━━━━━━━━━━━━━━━━━━━━
🆕 *Naya Order Aaya!*

👤 Customer: ${order.customerName}
📞 Phone: ${order.customerPhone}
📍 Address: ${order.address}

📦 Items:
${itemsList}

💰 Total: ₹${order.totalAmount}
💳 Payment: ${order.paymentMethod}

🕐 Time: ${new Date().toLocaleString('hi-IN')}`;

  const ownerNum = process.env.OWNER_WHATSAPP?.replace('whatsapp:', '') || '+919876543210';
  return sendWhatsApp(ownerNum, message);
}

// ══════════════════════════════════════════════════
// 5. PAYMENT SUCCESS — customer ko
// ══════════════════════════════════════════════════
async function sendPaymentSuccess(order, paymentId) {
  const message =
`🐄 *Shree Gau Dairy*
━━━━━━━━━━━━━━━━━━━━
✅ *Payment Successful!*

Namaste *${order.customerName}* ji! 🙏

Aapki payment ho gayi!

💰 Amount: ₹${order.totalAmount}
🧾 Payment ID: ${paymentId}
📋 Order ID: #${String(order._id).slice(-6).toUpperCase()}

Delivery subah 7 baje hogi! 🌅

Shukriya aapka Shree Gau Dairy choose karne ke liye! 🐄❤️`;

  return sendWhatsApp(order.customerPhone, message);
}

// ══════════════════════════════════════════════════
// 6. DAILY SUMMARY — owner ko (har raat 9 baje)
// ══════════════════════════════════════════════════
async function sendDailySummary(stats) {
  const message =
`🐄 *Shree Gau Dairy — Daily Report*
━━━━━━━━━━━━━━━━━━━━
📅 Date: ${new Date().toLocaleDateString('hi-IN')}

📊 *Aaj Ka Summary:*

🛒 Naye Orders: ${stats.newOrders}
✅ Delivered: ${stats.delivered}
⏳ Pending: ${stats.pending}
❌ Cancelled: ${stats.cancelled}

💰 *Revenue:*
  Aaj: ₹${stats.todayRevenue}
  Total Due: ₹${stats.totalDue}

⚠️ Payment Pending: ${stats.paymentPending} orders

Kal subah delivery ready rakhein! 🌅`;

  const ownerNum = process.env.OWNER_WHATSAPP?.replace('whatsapp:', '') || '+919876543210';
  return sendWhatsApp(ownerNum, message);
}

module.exports = {
  sendWhatsApp,
  sendOrderConfirmation,
  sendPaymentReminder,
  sendStatusUpdate,
  sendOwnerAlert,
  sendPaymentSuccess,
  sendDailySummary,
};
