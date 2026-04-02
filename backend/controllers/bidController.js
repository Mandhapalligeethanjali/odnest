const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────
// @route   POST /api/bids/:projectId
// @desc    Submit a bid on a project
// @access  Private (freelancer only)
// ─────────────────────────────────────────
const submitBid = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { amount, proposal, delivery_days } = req.body;

    if (!amount || !proposal || !delivery_days) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, proposal and delivery days'
      });
    }

    // Check project exists
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check project is open
    if (project.rows[0].status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Project is not open for bids'
      });
    }

    // Check freelancer hasn't already bid
    const existingBid = await pool.query(
      'SELECT * FROM bids WHERE project_id = $1 AND freelancer_id = $2',
      [projectId, req.user.id]
    );

    if (existingBid.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already bid on this project'
      });
    }

    // Check client is not bidding on own project
    if (project.rows[0].client_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own project'
      });
    }

    const result = await pool.query(
      `INSERT INTO bids
        (id, project_id, freelancer_id, amount, proposal, delivery_days)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        uuidv4(),
        projectId,
        req.user.id,
        amount,
        proposal,
        delivery_days
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      bid: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @rou