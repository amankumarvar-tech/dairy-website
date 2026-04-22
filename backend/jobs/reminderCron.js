// =====================================================
// jobs/reminderCron.js
// Automatic WhatsApp reminders — node-cron se
// =====================================================

const cron = require('node-cron');
const Order = require('../models/Order');
const {
  sendPaymentReminder,
  sendDailySummary,
} = require('../services/whatsapp');

// ══════════════════════════════════════════════════
// JOB 1: Payment Reminders
// Schedule: Har din subah 10 baje
// Kaam: Pending payment orders ko WhatsApp bhejo
// ══════════════════════════════════════════════════
function startPaymentReminderJob() {
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ [CRON] Payment reminder job start...');

    try {
      const now = new Date();
      const oneDayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

      // Pending payment orders jo delivered hain ya cash on delivery hain
      const pendingOrders = await Order.find({
        paymentStatus: 'pending',
        status: { $in: ['delivered', 'confirmed', 'dispatched'] },
        createdAt: { $gte: sevenDaysAgo },  // 7 din se zyada purane ignore
      });

      console.log(`📋 Found ${pendingOrders.length} pending payment orders`);

      for (const order of pendingOrders) {
        const orderAge = Math.floor((now - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));

        // Har order ki age ke hisaab se reminder bhejo
        let shouldSend = false;

        if (orderAge === 0) shouldSend = true;       // Aaj ka
        else if (orderAge === 1) shouldSend = true;  // 1 din purana
        else if (orderAge === 3) shouldSend = true;  // 3 din purane
        else if (orderAge === 7) shouldSend = true;  // 7 din purane (last reminder)

        if (shouldSend) {
          await sendPaymentReminder(order, orderAge);
          // Reminder log karo
          await Order.findByIdAndUpdate(order._id, {
            $push: {
              reminderHistory: {
                sentAt: new Date(),
                daysOverdue: orderAge,
                type: 'payment_reminder',
              },
            },
          });
          console.log(`✅ Reminder sent to ${order.customerName} (${orderAge} days overdue)`);
          // Rate limit avoid karne ke liye 1 sec wait
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (err) {
      console.error('❌ Payment reminder cron error:', err.message);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  console.log('✅ Payment Reminder Cron scheduled: 10:00 AM daily (IST)');
}

// ══════════════════════════════════════════════════
// JOB 2: Daily Summary to Owner
// Schedule: Har din raat 9 baje
// ══════════════════════════════════════════════════
function startDailySummaryJob() {
  cron.schedule('0 21 * * *', async () => {
    console.log('⏰ [CRON] Daily summary job start...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Aaj ke orders
      const todayOrders = await Order.find({
        createdAt: { $gte: today, $lt: tomorrow },
      });

      // Pending payments (sab time ka)
      const pendingPayments = await Order.find({ paymentStatus: 'pending' });
      const totalDue = pendingPayments.reduce((s, o) => s + o.totalAmount, 0);

      const stats = {
        newOrders: todayOrders.length,
        delivered: todayOrders.filter(o => o.status === 'delivered').length,
        pending: todayOrders.filter(o => o.status === 'pending').length,
        cancelled: todayOrders.filter(o => o.status === 'cancelled').length,
        todayRevenue: todayOrders
          .filter(o => o.paymentStatus === 'paid')
          .reduce((s, o) => s + o.totalAmount, 0),
        totalDue,
        paymentPending: pendingPayments.length,
      };

      await sendDailySummary(stats);
      console.log('✅ Daily summary sent to owner');
    } catch (err) {
      console.error('❌ Daily summary cron error:', err.message);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  console.log('✅ Daily Summary Cron scheduled: 9:00 PM daily (IST)');
}

// ══════════════════════════════════════════════════
// JOB 3: Morning Delivery Reminder to Owner
// Schedule: Har din subah 5 baje
// ══════════════════════════════════════════════════
function startMorningDeliveryJob() {
  cron.schedule('0 5 * * *', async () => {
    console.log('⏰ [CRON] Morning delivery reminder...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayDeliveries = await Order.find({
        status: { $in: ['confirmed', 'pending'] },
        createdAt: { $gte: new Date(today - 2 * 24 * 60 * 60 * 1000), $lt: tomorrow },
      });

      if (todayDeliveries.length > 0) {
        const { sendWhatsApp } = require('../services/whatsapp');
        const ownerNum = process.env.OWNER_WHATSAPP?.replace('whatsapp:', '') || '+919876543210';
        const list = todayDeliveries.map(o => `  • ${o.customerName} — ₹${o.totalAmount}`).join('\n');

        await sendWhatsApp(ownerNum,
`🌅 *Subah ho gayi! Delivery time!*
🐄 Shree Gau Dairy

Aaj ${todayDeliveries.length} deliveries pending hain:
${list}

Jai Gau Mata! 🙏`
        );
      }
    } catch (err) {
      console.error('❌ Morning delivery cron error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('✅ Morning Delivery Cron scheduled: 5:00 AM daily (IST)');
}

// ── Start all jobs ───────────────────────────────────
function startAllCronJobs() {
  startPaymentReminderJob();
  startDailySummaryJob();
  startMorningDeliveryJob();
  console.log('🚀 All cron jobs started!');
}

module.exports = { startAllCronJobs };
