const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere'
});

// Create order for payment
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    const options = {
      amount: amount * 100, // Amount in paise (multiply by 100)
      currency: currency,
      receipt: receipt,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Verify payment (after successful payment)
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, milestone_id, freelancer_id, project_id } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature === razorpay_signature) {
      // Payment is verified - store in database
      const result = await pool.query(
        `INSERT INTO payments (milestone_id, client_id, freelancer_id, amount, transaction_id, payment_method, escrow_status)
         VALUES ($1, $2, $3, $4, $5, 'razorpay', 'held')
         RETURNING *`,
        [milestone_id, req.user.id, freelancer_id, req.body.amount / 100, razorpay_payment_id]
      );
      
      res.json({
        success: true,
        message: 'Payment verified and stored',
        payment: result.rows[0]
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Get payments for client
router.get('/client', protect, authorize('client'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
              pr.title as project_title,
              u.name as freelancer_name
       FROM payments p
       JOIN projects pr ON p.project_id = pr.id
       JOIN users u ON p.freelancer_id = u.id
       WHERE p.client_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ payments: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Release payment from escrow
router.put('/:id/release', protect, authorize('client'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE payments 
       SET escrow_status = 'released'
       WHERE id = $1 AND client_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    
    res.json({ payment: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;