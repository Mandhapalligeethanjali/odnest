const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const submitBid = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { amount, proposal, delivery_days } = req.body;

    if (!amount || !proposal || !delivery_days) {
      return res.status(400).json({ success: false, message: 'Please provide amount, proposal and delivery days' });
    }

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.rows[0].status !== 'open') return res.status(400).json({ success: false, message: 'Project is not open for bids' });
    if (project.rows[0].client_id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot bid on your own project' });

    const existingBid = await pool.query('SELECT * FROM bids WHERE project_id = $1 AND freelancer_id = $2', [projectId, req.user.id]);
    if (existingBid.rows.length > 0) return res.status(400).json({ success: false, message: 'You have already bid on this project' });

    const result = await pool.query(
      `INSERT INTO bids (id, project_id, freelancer_id, amount, proposal, delivery_days)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), projectId, req.user.id, amount, proposal, delivery_days]
    );

    res.status(201).json({ success: true, message: 'Bid submitted successfully', bid: result.rows[0] });
  } catch (err) { next(err); }
};

const getProjectBids = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized to view these bids' });

    const result = await pool.query(
      `SELECT b.*, u.name as freelancer_name, u.avatar as freelancer_avatar,
              u.rating as freelancer_rating, u.skills as freelancer_skills,
              u.total_reviews as freelancer_reviews
       FROM bids b JOIN users u ON b.freelancer_id = u.id
       WHERE b.project_id = $1 ORDER BY b.created_at DESC`,
      [projectId]
    );

    res.status(200).json({ success: true, count: result.rows.length, bids: result.rows });
  } catch (err) { next(err); }
};

const getMyBids = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, p.title as project_title, p.budget as project_budget,
              p.status as project_status, u.name as client_name
       FROM bids b
       JOIN projects p ON b.project_id = p.id
       JOIN users u ON p.client_id = u.id
       WHERE b.freelancer_id = $1 ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ success: true, count: result.rows.length, bids: result.rows });
  } catch (err) { next(err); }
};

const acceptBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;

    const bid = await pool.query('SELECT * FROM bids WHERE id = $1', [bidId]);
    if (bid.rows.length === 0) return res.status(404).json({ success: false, message: 'Bid not found' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [bid.rows[0].project_id]);
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized to accept this bid' });

    await pool.query('UPDATE bids SET status = $1 WHERE id = $2', ['accepted', bidId]);
    await pool.query(`UPDATE bids SET status = 'rejected' WHERE project_id = $1 AND id != $2`, [bid.rows[0].project_id, bidId]);
    await pool.query(`UPDATE projects SET status = 'in_progress' WHERE id = $1`, [bid.rows[0].project_id]);

    res.status(200).json({ success: true, message: 'Bid accepted successfully' });
  } catch (err) { next(err); }
};

const rejectBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;
    await pool.query('UPDATE bids SET status = $1 WHERE id = $2', ['rejected', bidId]);
    res.status(200).json({ success: true, message: 'Bid rejected successfully' });
  } catch (err) { next(err); }
};

const deleteBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;

    const bid = await pool.query('SELECT * FROM bids WHERE id = $1', [bidId]);
    if (bid.rows.length === 0) return res.status(404).json({ success: false, message: 'Bid not found' });
    if (bid.rows[0].freelancer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized to delete this bid' });

    await pool.query('DELETE FROM bids WHERE id = $1', [bidId]);
    res.status(200).json({ success: true, message: 'Bid deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { submitBid, getProjectBids, getMyBids, acceptBid, rejectBid, deleteBid };