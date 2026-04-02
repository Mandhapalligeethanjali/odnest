const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────
// @route   POST /api/reviews/:projectId
// @desc    Leave a review after project completion
// @access  Private
// ─────────────────────────────────────────
const createReview = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { revieweeId, rating, comment } = req.body;

    if (!revieweeId || !rating) return res.status(400).json({ success: false, message: 'Please provide revieweeId and rating' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

    // Check project exists
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });

    // Check project is completed or in_progress
    if (!['in_progress', 'completed'].includes(project.rows[0].status)) {
      return res.status(400).json({ success: false, message: 'Can only review on active or completed projects' });
    }

    // Check already reviewed
    const existing = await pool.query(
      'SELECT * FROM reviews WHERE project_id = $1 AND reviewer_id = $2',
      [projectId, req.user.id]
    );
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: 'You have already reviewed this project' });

    // Insert review
    const result = await pool.query(
      `INSERT INTO reviews (id, project_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), projectId, req.user.id, revieweeId, rating, comment || null]
    );

    // Update reviewee average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE reviewee_id = $1',
      [revieweeId]
    );
    await pool.query(
      'UPDATE users SET rating = $1, total_reviews = $2 WHERE id = $3',
      [parseFloat(avgResult.rows[0].avg).toFixed(2), avgResult.rows[0].count, revieweeId]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully', review: result.rows[0] });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a user
// @access  Public
// ─────────────────────────────────────────
const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar,
              p.title as project_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       JOIN projects p ON r.project_id = p.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.status(200).json({ success: true, count: result.rows.length, reviews: result.rows });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   GET /api/reviews/project/:projectId
// @desc    Get all reviews for a project
// @access  Public
// ─────────────────────────────────────────
const getProjectReviews = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.project_id = $1
       ORDER BY r.created_at DESC`,
      [projectId]
    );

    res.status(200).json({ success: true, count: result.rows.length, reviews: result.rows });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────
// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private (reviewer only)
// ─────────────────────────────────────────
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await pool.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
    if (review.rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.rows[0].reviewer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createReview, getUserReviews, getProjectReviews, deleteReview };