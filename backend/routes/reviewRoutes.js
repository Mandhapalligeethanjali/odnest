const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Adjust path to your DB config
const { protect, authorize } = require('../middleware/authMiddleware');

// Get reviews for freelancer (authenticated freelancer sees their own reviews)
router.get('/freelancer', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all reviews where the reviewee is this freelancer
    const reviewsQuery = await pool.query(
      `SELECT r.*, 
              u.name as reviewer_name,
              p.title as project_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    
    // Calculate average rating
    const avgQuery = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, 
              COALESCE(COUNT(*), 0) as total_reviews
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );
    
    res.json({
      reviews: reviewsQuery.rows,
      average_rating: parseFloat(avgQuery.rows[0].avg_rating) || 0,
      total_reviews: parseInt(avgQuery.rows[0].total_reviews) || 0
    });
  } catch (error) {
    console.error('Error fetching freelancer reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews for client
router.get('/client', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reviewsQuery = await pool.query(
      `SELECT r.*, 
              u.name as reviewer_name,
              p.title as project_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    
    const avgQuery = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, 
              COALESCE(COUNT(*), 0) as total_reviews
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );
    
    res.json({
      reviews: reviewsQuery.rows,
      average_rating: parseFloat(avgQuery.rows[0].avg_rating) || 0,
      total_reviews: parseInt(avgQuery.rows[0].total_reviews) || 0
    });
  } catch (error) {
    console.error('Error fetching client reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews for a specific project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const reviewsQuery = await pool.query(
      `SELECT r.*, 
              u.name as reviewer_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.project_id = $1
       ORDER BY r.created_at DESC`,
      [projectId]
    );
    
    res.json({ reviews: reviewsQuery.rows });
  } catch (error) {
    console.error('Error fetching project reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a review (client can review freelancer)
router.post('/', protect, async (req, res) => {
  try {
    const { project_id, reviewee_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;
    
    // Check if user has already reviewed this project
    const existingCheck = await pool.query(
      'SELECT id FROM reviews WHERE project_id = $1 AND reviewer_id = $2',
      [project_id, reviewer_id]
    );
    
    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this project' });
    }
    
    // Create the review
    const newReview = await pool.query(
      `INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [project_id, reviewer_id, reviewee_id, rating, comment]
    );
    
    // Update user's average rating
    await pool.query(
      `UPDATE users 
       SET rating = COALESCE(
         (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1), 0
       ),
       total_reviews = COALESCE(
         (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1), 0
       )
       WHERE id = $1`,
      [reviewee_id]
    );
    
    res.status(201).json({ success: true, review: newReview.rows[0] });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a review
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Check if user owns this review
    const reviewCheck = await pool.query(
      'SELECT reviewee_id FROM reviews WHERE id = $1 AND reviewer_id = $2',
      [id, userId]
    );
    
    if (reviewCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to edit this review' });
    }
    
    const updatedReview = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id]
    );
    
    // Update user's average rating
    const revieweeId = reviewCheck.rows[0].reviewee_id;
    await pool.query(
      `UPDATE users 
       SET rating = COALESCE(
         (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1), 0
       )
       WHERE id = $1`,
      [revieweeId]
    );
    
    res.json({ success: true, review: updatedReview.rows[0] });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a review
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const reviewCheck = await pool.query(
      'SELECT reviewee_id FROM reviews WHERE id = $1 AND reviewer_id = $2',
      [id, userId]
    );
    
    if (reviewCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to delete this review' });
    }
    
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    // Update user's average rating
    const revieweeId = reviewCheck.rows[0].reviewee_id;
    await pool.query(
      `UPDATE users 
       SET rating = COALESCE(
         (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1), 0
       ),
       total_reviews = COALESCE(
         (SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1), 0
       )
       WHERE id = $1`,
      [revieweeId]
    );
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;