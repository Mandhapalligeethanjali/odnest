const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────
// @route   POST /api/projects
// @desc    Create new project
// @access  Private (client only)
// ─────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      budget,
      skills_required,
      deadline,
      location,
      is_remote
    } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description and budget'
      });
    }

    const result = await pool.query(
      `INSERT INTO projects 
        (id, client_id, title, description, budget, 
         skills_required, deadline, location, is_remote)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        uuidv4(),
        req.user.id,
        title,
        description,
        budget,
        skills_required || [],
        deadline || null,
        location || null,
        is_remote ?? true
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/projects
// @desc    Get all open projects with filters
// @access  Public
// ─────────────────────────────────────────
const getAllProjects = async (req, res, next) => {
  try {
    const { skill, location, min_budget, max_budget, status } = req.query;

    let query = `
      SELECT p.*, 
             u.name as client_name, 
             u.avatar as client_avatar,
             u.rating as client_rating
      FROM projects p
      JOIN users u ON p.client_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (skill) {
      query += ` AND $${paramCount} = ANY(p.skills_required)`;
      params.push(skill);
      paramCount++;
    }

    if (location) {
      query += ` AND p.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
      paramCount++;
    }

    if (min_budget) {
      query += ` AND p.budget >= $${paramCount}`;
      params.push(min_budget);
      paramCount++;
    }

    if (max_budget) {
      query += ` AND p.budget <= $${paramCount}`;
      params.push(max_budget);
      paramCount++;
    }

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    } else {
      query += ` AND p.status = 'open'`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Public
// ─────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, 
              u.name as client_name,
              u.avatar as client_avatar,
              u.rating as client_rating,
              u.location as client_location
       FROM projects p
       JOIN users u ON p.client_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      project: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (owner only)
// ─────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      budget,
      skills_required,
      deadline,
      location,
      is_remote,
      status
    } = req.body;

    // Check project exists and belongs to user
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.rows[0].client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const result = await pool.query(
      `UPDATE projects
       SET title           = COALESCE($1, title),
           description     = COALESCE($2, description),
           budget          = COALESCE($3, budget),
           skills_required = COALESCE($4, skills_required),
           deadline        = COALESCE($5, deadline),
           location        = COALESCE($6, location),
           is_remote       = COALESCE($7, is_remote),
           status          = COALESCE($8, status)
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        budget,
        skills_required,
        deadline,
        location,
        is_remote,
        status,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (owner only)
// ─────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.rows[0].client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/projects/my/projects
// @desc    Get all projects by logged in client
// @access  Private
// ─────────────────────────────────────────
const getMyProjects = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects 
       WHERE client_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      projects: result.rows
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects
};