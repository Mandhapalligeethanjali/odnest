const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('JWT SECRET:', process.env.JWT_SECRET);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
// ─────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body;

    // Check all fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and role'
      });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users (id, name, email, password, role, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, location, created_at`,
      [uuidv4(), name, email, hashedPassword, role, location || null]
    );

    const user = newUser.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });

  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
// ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar, bio, location, skills, hourly_rate, rating, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };