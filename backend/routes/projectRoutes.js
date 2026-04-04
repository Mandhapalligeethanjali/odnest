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

// Send invitation to freelancer
router.post('/invite', protect, authorize('client'), async (req, res) => {
  try {
    const { freelancer_id, project_id, message } = req.body;
    const client_id = req.user.id;
    
    // Check if project exists and belongs to this client
    const projectCheck = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND client_id = $2 AND status = 'open'`,
      [project_id, client_id]
    );
    
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found or not open' });
    }
    
    // Check if invitation already exists
    const existingInvite = await pool.query(
      `SELECT * FROM invitations WHERE project_id = $1 AND freelancer_id = $2`,
      [project_id, freelancer_id]
    );
    
    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ message: 'Invitation already sent to this freelancer' });
    }
    
    // Create invitation
    const result = await pool.query(
      `INSERT INTO invitations (project_id, client_id, freelancer_id, message, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [project_id, client_id, freelancer_id, message]
    );
    
    res.status(201).json({ 
      success: true, 
      invitation: result.rows[0],
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invitations for freelancer
router.get('/invitations', protect, authorize('freelancer'), async (req, res) => {
  try {
    const freelancer_id = req.user.id;
    
    const result = await pool.query(
      `SELECT i.*, 
              p.title as project_title,
              p.description as project_description,
              p.budget as project_budget,
              u.name as client_name,
              u.email as client_email
       FROM invitations i
       JOIN projects p ON i.project_id = p.id
       JOIN users u ON i.client_id = u.id
       WHERE i.freelancer_id = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [freelancer_id]
    );
    
    res.json({ invitations: result.rows });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept invitation
router.put('/invitations/:id/accept', protect, authorize('freelancer'), async (req, res) => {
  try {
    const invitationId = req.params.id;
    const freelancer_id = req.user.id;
    
    // Get invitation details
    const invitationResult = await pool.query(
      `SELECT * FROM invitations WHERE id = $1 AND freelancer_id = $2 AND status = 'pending'`,
      [invitationId, freelancer_id]
    );
    
    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    const invitation = invitationResult.rows[0];
    
    // Update invitation status
    await pool.query(
      `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
      [invitationId]
    );
    
    // Create a bid automatically when accepting invitation
    await pool.query(
      `INSERT INTO bids (project_id, freelancer_id, amount, proposal, delivery_days, status)
       VALUES ($1, $2, $3, $4, $5, 'accepted')`,
      [invitation.project_id, freelancer_id, 0, invitation.message || 'Accepted invitation', 7]
    );
    
    // Update project status to in_progress
    await pool.query(
      `UPDATE projects SET status = 'in_progress' WHERE id = $1`,
      [invitation.project_id]
    );
    
    res.json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline invitation
router.put('/invitations/:id/decline', protect, authorize('freelancer'), async (req, res) => {
  try {
    const invitationId = req.params.id;
    const freelancer_id = req.user.id;
    
    const result = await pool.query(
      `UPDATE invitations 
       SET status = 'declined' 
       WHERE id = $1 AND freelancer_id = $2 AND status = 'pending'
       RETURNING *`,
      [invitationId, freelancer_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;