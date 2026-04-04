const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Get all conversations for a user
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Simplified query - get unique project conversations
    const result = await pool.query(
      `SELECT DISTINCT 
        m.project_id,
        p.title as project_title,
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        u.name as other_user_name,
        (
          SELECT message FROM messages m2 
          WHERE m2.project_id = m.project_id 
          AND (m2.sender_id = $1 OR m2.receiver_id = $1)
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM messages m2 
          WHERE m2.project_id = m.project_id 
          AND (m2.sender_id = $1 OR m2.receiver_id = $1)
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) FROM messages m2 
          WHERE m2.project_id = m.project_id 
          AND m2.receiver_id = $1 AND m2.is_read = false
        ) as unread_count
      FROM messages m
      JOIN projects p ON m.project_id = p.id
      JOIN users u ON u.id = (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END
      )
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY last_message_time DESC`,
      [userId]
    );
    
    res.json({ conversations: result.rows || [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Return empty array instead of error
    res.json({ conversations: [] });
  }
});

// Get messages for a specific project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Get messages
    const result = await pool.query(
      `SELECT m.*, 
              u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC`,
      [projectId]
    );
    
    // Mark messages as read (optional - don't let this fail the request)
    try {
      await pool.query(
        `UPDATE messages 
         SET is_read = true 
         WHERE project_id = $1 AND receiver_id = $2 AND is_read = false`,
        [projectId, userId]
      );
    } catch (updateError) {
      console.log('Error marking messages as read:', updateError.message);
    }
    
    res.json({ 
      messages: result.rows || [],
      project: { id: projectId }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.json({ messages: [] });
  }
});

// Send a message
router.post('/send', protect, async (req, res) => {
  try {
    const { project_id, receiver_id, message } = req.body;
    const sender_id = req.user.id;
    
    const result = await pool.query(
      `INSERT INTO messages (project_id, sender_id, receiver_id, message, is_read)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [project_id, sender_id, receiver_id, message, false]
    );
    
    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get unread count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM messages
       WHERE receiver_id = $1 AND is_read = false`,
      [userId]
    );
    
    res.json({ unreadCount: parseInt(result.rows[0]?.count || 0) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.json({ unreadCount: 0 });
  }
});

// Send direct message to a user (for invitations)
router.post('/direct', protect, async (req, res) => {
  try {
    const { receiver_id, message, related_project_id } = req.body;
    const sender_id = req.user.id;
    
    const result = await pool.query(
      `INSERT INTO messages (project_id, sender_id, receiver_id, message, is_read)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [related_project_id || null, sender_id, receiver_id, message, false]
    );
    
    res.status(201).json({ message: result.rows[0] });
  } catch (error) {
    console.error('Error sending direct message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;