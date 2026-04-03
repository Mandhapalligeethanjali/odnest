const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ─────────────────────────────────────────
// @route   POST /api/payments/create-order
// @desc    Create a test payment order
// @access  Private (client only)
// ─────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { milestoneId } = req.body;

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [milestone.rows[0].project_id]);
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Generate fake order
    const fakeOrder = {
      id: `order_test_${uuidv4().slice(0, 16)}`,
      amount: milestone.rows[0].amount * 100,
      currency: 'INR',
      receipt: `receipt_${milestoneId.slice(0, 8)}`,
      status: 'created',
      milestoneId
    };

    res.status(200).json({
      success: true,
      message: 'Test order created',
      order: fakeOrder,
      milestone: milestone.rows[0]
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   POST /api/payments/verify
// @desc    Simulate payment verification + hold in escrow
// @access  Private (client only)
// ─────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { milestoneId, freelancerId, simulateFailure } = req.body;

    if (!milestoneId || !freelancerId) {
      return res.status(400).json({ success: false, message: 'Please provide milestoneId and freelancerId' });
    }

    // Simulate payment failure if requested
    if (simulateFailure) {
      return res.status(400).json({ success: false, message: 'Test payment failed - simulated failure' });
    }

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });

    // Generate fake transaction ID
    const fakeTransactionId = `pay_test_${crypto.randomBytes(8).toString('hex')}`;

    // Save to DB with escrow status 'held'
    const payment = await pool.query(
      `INSERT INTO payments (id, milestone_id, client_id, freelancer_id, amount, transaction_id, payment_method, escrow_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'razorpay', 'held') RETURNING *`,
      [uuidv4(), milestoneId, req.user.id, freelancerId, milestone.rows[0].amount, fakeTransactionId]
    );

    // Update milestone to in_progress
    await pool.query(`UPDATE milestones SET status = 'in_progress' WHERE id = $1`, [milestoneId]);

    res.status(200).json({
      success: true,
      message: '✅ Test payment verified and held in escrow',
      transaction_id: fakeTransactionId,
      payment: payment.rows[0]
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   POST /api/payments/release
// @desc    Release payment from escrow to freelancer
// @access  Private (client only)
// ─────────────────────────────────────────
const releasePayment = async (req, res, next) => {
  try {
    const { milestoneId } = req.body;

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });
    if (milestone.rows[0].status !== 'approved') return res.status(400).json({ success: false, message: 'Milestone must be approved before releasing payment' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [milestone.rows[0].project_id]);
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await pool.query(`UPDATE payments SET escrow_status = 'released' WHERE milestone_id = $1`, [milestoneId]);

    res.status(200).json({ success: true, message: '✅ Payment released to freelancer successfully' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   POST /api/payments/refund
// @desc    Simulate refund back to client
// @access  Private (client only)
// ─────────────────────────────────────────
const refundPayment = async (req, res, next) => {
  try {
    const { milestoneId } = req.body;

    const payment = await pool.query(`SELECT * FROM payments WHERE milestone_id = $1`, [milestoneId]);
    if (payment.rows.length === 0) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.rows[0].escrow_status !== 'held') return res.status(400).json({ success: false, message: 'Only held payments can be refunded' });
    if (payment.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await pool.query(`UPDATE payments SET escrow_status = 'refunded' WHERE milestone_id = $1`, [milestoneId]);

    res.status(200).json({ success: true, message: '✅ Test refund processed successfully' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   GET /api/payments/my
// @desc    Get payment history
// @access  Private
// ─────────────────────────────────────────
const getMyPayments = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.*, m.title as milestone_title, pr.title as project_title
       FROM payments p
       JOIN milestones m ON p.milestone_id = m.id
       JOIN projects pr ON m.project_id = pr.id
       WHERE p.client_id = $1 OR p.freelancer_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ success: true, count: result.rows.length, payments: result.rows });
  } catch (err) { next(err); }
};

module.exports = { createOrder, verifyPayment, releasePayment, refundPayment, getMyPayments };