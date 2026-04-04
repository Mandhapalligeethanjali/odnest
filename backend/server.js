const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/milestones', require('./routes/milestoneRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.get('/', (req, res) => {
  res.json({ message: '🚀 ODnest API is running!' });
});

// Socket.io connection handling
const users = new Map(); // Store socket.id -> userId
const userSockets = new Map(); // Store userId -> socket.id

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Store user connection
  users.set(socket.userId, socket.id);
  userSockets.set(socket.id, socket.userId);
  
  // Join user's personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle joining a chat room (project-based)
  socket.on('join_project_room', (projectId) => {
    const roomName = `project_${projectId}`;
    socket.join(roomName);
    console.log(`User ${socket.userId} joined room: ${roomName}`);
  });
  
  // Handle leaving a chat room
  socket.on('leave_project_room', (projectId) => {
    const roomName = `project_${projectId}`;
    socket.leave(roomName);
    console.log(`User ${socket.userId} left room: ${roomName}`);
  });
  
  // Handle sending message
  socket.on('send_message', async (data) => {
    try {
      const { projectId, receiverId, message, senderName } = data;
      
      // Store message in database
      const { pool } = require('./db');
      const result = await pool.query(
        `INSERT INTO messages (project_id, sender_id, receiver_id, message, is_read)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [projectId, socket.userId, receiverId, message, false]
      );
      
      const savedMessage = result.rows[0];
      
      // Emit to project room
      io.to(`project_${projectId}`).emit('receive_message', {
        id: savedMessage.id,
        projectId: projectId,
        senderId: socket.userId,
        receiverId: receiverId,
        message: message,
        senderName: senderName,
        timestamp: savedMessage.created_at,
        is_read: false
      });
      
      // Notify receiver individually
      const receiverSocketId = users.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message_notification', {
          projectId: projectId,
          senderName: senderName,
          message: message.substring(0, 50)
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    const { projectId, isTyping, senderName } = data;
    socket.to(`project_${projectId}`).emit('user_typing', {
      userId: socket.userId,
      senderName: senderName,
      isTyping: isTyping
    });
  });
  
  // Handle marking messages as read
  socket.on('mark_as_read', async (data) => {
    try {
      const { projectId, senderId } = data;
      const { pool } = require('./db');
      
      await pool.query(
        `UPDATE messages 
         SET is_read = true 
         WHERE project_id = $1 AND sender_id = $2 AND receiver_id = $3 AND is_read = false`,
        [projectId, senderId, socket.userId]
      );
      
      // Notify sender that messages were read
      const senderSocketId = users.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', {
          projectId: projectId,
          readBy: socket.userId
        });
      }
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    users.delete(socket.userId);
    userSockets.delete(socket.id);
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Socket.io ready for connections`);
});