module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // Join a room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Send message
    socket.on('send_message', (data) => {
      io.to(data.roomId).emit('receive_message', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};