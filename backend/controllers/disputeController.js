const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────
// @route   POST /api/disputes/:projectId
// @desc    Raise a dispute
// @access  Private
// ─────────────────────────────────────────
const raiseDispute = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ success: false, message: 'Please provide a reason' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check existing dispute
    const existing = await pool.query(
      `SELECT * FROM disputes WHERE project_id = $1 AND status = 'open'`,
      [projectId]
    );
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: 'A dispute already exists for this project' });

    const result = await pool.query(
      `INSERT INTO disputes (id, project_id, raised_by, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [uuidv4(), projectId, req.user.id, reason]
    );

    res.status(201).json({ success: true, message: 'Dispute raised successfully', dispute: result.rows[0] });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   GET /api/disputes/my
// @desc    Get my disputes
// @access  Private
// ─────────────────────────────────────────
const getMyDisputes = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.title as project_title
       FROM disputes d
       JOIN projects p ON d.project_id = p.id
       WHERE d.raised_by = $1
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ success: true, count: result.rows.length, disputes: result.rows });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   GET /api/disputes
// @desc    Get all disputes (admin only)
// @access  Private (admin)
// ─────────────────────────────────────────
const getAllDisputes = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.title as project_title, u.name as raised_by_name
       FROM disputes d
       JOIN projects p ON d.project_id = p.id
       JOIN users u ON d.raised_by = u.id
       ORDER BY d.created_at DESC`
    );

    res.status(200).json({ success: true, count: result.rows.length, disputes: result.rows });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   PUT /api/disputes/:disputeId/resolve
// @desc    Resolve a dispute (admin only)
// @access  Private (admin)
// ─────────────────────────────────────────
const resolveDispute = async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { resolution } = req.body;

    if (!resolution) return res.status(400).json({ success: false, message: 'Please provide resolution' });

    const dispute = await pool.query('SELECT * FROM disputes WHERE id = $1', [disputeId]);
    if (dispute.rows.length === 0) return res.status(404).json({ success: false, message: 'Dispute not found' });

    await pool.query(
      `UPDATE disputes SET status = 'resolved', resolution = $1 WHERE id = $2`,
      [resolution, disputeId]
    );

    res.status(200).json({ success: true, message: 'Dispute resolved successfully' });
  } catch (err) { next(err); }
};

module.exports = { raiseDispute, getMyDisputes, getAllDisputes, resolveDispute };