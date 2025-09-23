const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Allow CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// 👇 These lines let Express parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Track connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registers their ID with the socket
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Generic broadcast events
  socket.on('notification', (data) => {
    console.log('Notification received:', data);
    socket.broadcast.emit('new-notification', data);
  });

  socket.on('action', (data) => {
    console.log('Action received:', data);
    io.emit('action-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Laravel → POST → here
app.post('/notify', (req, res) => {
    const data = req.body;
    console.log('Notification from Laravel:', data);

    // Broadcast to ALL connected clients
    io.emit('action-update', data);

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
