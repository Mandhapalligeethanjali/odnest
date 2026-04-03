const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get client's projects
router.get('/my', protect, authorize('client'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ projects: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get completed projects for client (to review)
router.get('/completed', protect, authorize('client'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT p.*, 
              u.name as freelancer_name,
              u.id as freelancer_id,
              EXISTS(
                SELECT 1 FROM reviews r 
                WHERE r.project_id = p.id AND r.reviewer_id = $1
              ) as reviewed
       FROM projects p
       JOIN bids b ON b.project_id = p.id AND b.status = 'accepted'
       JOIN users u ON b.freelancer_id = u.id
       WHERE p.client_id = $1 AND p.status = 'completed'
       ORDER BY p.created_at DESC`,
      [userId]
    );
    
    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Error fetching completed projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all open projects (for freelancers)
router.get('/', protect, async (req, res) => {
  try {
    const { search, minBudget, maxBudget, skills, location, isRemote } = req.query;
    
    let query = `SELECT * FROM projects WHERE status = 'open'`;
    let params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (minBudget) {
      query += ` AND budget >= $${paramIndex}`;
      params.push(minBudget);
      paramIndex++;
    }
    
    if (maxBudget) {
      query += ` AND budget <= $${paramIndex}`;
      params.push(maxBudget);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    if (isRemote === 'true') {
      query += ` AND is_remote = true`;
    }
    
    if (skills) {
      const skillsArray = skills.split(',');
      query += ` AND skills_required && $${paramIndex}`;
      params.push(skillsArray);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json({ projects: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', protect, authorize('client'), async (req, res) => {
  try {
    const { title, description, budget, skills_required, deadline, location, is_remote } = req.body;
    
    const result = await pool.query(
      `INSERT INTO projects (client_id, title, description, budget, skills_required, deadline, location, is_remote)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title, description, budget, skills_required, deadline, location, is_remote]
    );
    
    res.status(201).json({ project: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;