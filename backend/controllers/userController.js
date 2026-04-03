const pool = require('../config/db');

// ─────────────────────────────────────────
// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
// ─────────────────────────────────────────
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, role, avatar, bio, location, 
              skills, hourly_rate, rating, total_reviews, 
              is_verified, created_at 
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
// ─────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, skills, hourly_rate } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE users 
       SET name        = COALESCE($1, name),
           bio         = COALESCE($2, bio),
           location    = COALESCE($3, location),
           skills      = COALESCE($4, skills),
           hourly_rate = COALESCE($5, hourly_rate)
       WHERE id = $6
       RETURNING id, name, email, role, bio, location, 
                 skills, hourly_rate, avatar, is_verified`,
      [name, bio, location, skills, hourly_rate, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/users/freelancers
// @desc    Get all freelancers with filters
// @access  Public
// ─────────────────────────────────────────
const getFreelancers = async (req, res, next) => {
  try {
    const { skill, location, min_rate, max_rate } = req.query;

    let query = `
      SELECT id, name, role, avatar, bio, location,
             skills, hourly_rate, rating, total_reviews, is_verified
      FROM users
      WHERE role = 'freelancer'
    `;

    const params = [];
    let paramCount = 1;

    if (skill) {
      query += ` AND $${paramCount} = ANY(skills)`;
      params.push(skill);
      paramCount++;
    }

    if (location) {
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (min_rate) {
      query += ` AND hourly_rate >= $${paramCount}`;
      params.push(min_rate);
      paramCount++;
    }

    if (max_rate) {
      query += ` AND hourly_rate <= $${paramCount}`;
      params.push(max_rate);
      paramCount++;
    }

    query += ` ORDER BY rating DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      freelancers: result.rows
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/users/profile
// @desc    Delete current user account
// @access  Private
// ─────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getFreelancers,
  deleteAccount
};