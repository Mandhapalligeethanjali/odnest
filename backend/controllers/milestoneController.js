const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createMilestone = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, amount, due_date } = req.body;

    if (!title || !amount) return res.status(400).json({ success: false, message: 'Please provide title and amount' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const result = await pool.query(
      `INSERT INTO milestones (id, project_id, title, description, amount, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), projectId, title, description || null, amount, due_date || null]
    );

    res.status(201).json({ success: true, message: 'Milestone created successfully', milestone: result.rows[0] });
  } catch (err) { next(err); }
};

const getProjectMilestones = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM milestones WHERE project_id = $1 ORDER BY created_at ASC', [projectId]);
    res.status(200).json({ success: true, count: result.rows.length, milestones: result.rows });
  } catch (err) { next(err); }
};

const submitMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const bid = await pool.query(
      `SELECT * FROM bids WHERE project_id = $1 AND freelancer_id = $2 AND status = 'accepted'`,
      [milestone.rows[0].project_id, req.user.id]
    );
    if (bid.rows.length === 0) return res.status(403).json({ success: false, message: 'Not authorized to submit this milestone' });

    await pool.query(`UPDATE milestones SET status = 'submitted' WHERE id = $1`, [milestoneId]);
    res.status(200).json({ success: true, message: 'Milestone submitted for review' });
  } catch (err) { next(err); }
};

const approveMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });
    if (milestone.rows[0].status !== 'submitted') return res.status(400).json({ success: false, message: 'Milestone has not been submitted yet' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [milestone.rows[0].project_id]);
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await pool.query(`UPDATE milestones SET status = 'approved' WHERE id = $1`, [milestoneId]);
    res.status(200).json({ success: true, message: 'Milestone approved successfully' });
  } catch (err) { next(err); }
};

const rejectMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [milestone.rows[0].project_id]);
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await pool.query(`UPDATE milestones SET status = 'rejected' WHERE id = $1`, [milestoneId]);
    res.status(200).json({ success: true, message: 'Milestone rejected' });
  } catch (err) { next(err); }
};

const deleteMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await pool.query('SELECT * FROM milestones WHERE id = $1', [milestoneId]);
    if (milestone.rows.length === 0) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [milestone.rows[0].project_id]);
    if (project.rows[0].client_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await pool.query('DELETE FROM milestones WHERE id = $1', [milestoneId]);
    res.status(200).json({ success: true, message: 'Milestone deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createMilestone, getProjectMilestones, submitMilestone, approveMilestone, rejectMilestone, deleteMilestone };