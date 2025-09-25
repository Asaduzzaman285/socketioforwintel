// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);

// // Allow CORS for Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: "*", 
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors());

// // 👇 These lines let Express parse JSON bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Track connected users
// const connectedUsers = new Map();

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // User registers their ID with the socket
//   socket.on('register', (userId) => {
//     connectedUsers.set(userId, socket.id);
//     console.log(`User ${userId} registered with socket ${socket.id}`);
//   });

//   // Generic broadcast events
//   socket.on('notification', (data) => {
//     console.log('Notification received:', data);
//     socket.broadcast.emit('new-notification', data);
//   });

//   socket.on('action', (data) => {
//     console.log('Action received:', data);
//     io.emit('action-update', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     for (let [userId, socketId] of connectedUsers.entries()) {
//       if (socketId === socket.id) {
//         connectedUsers.delete(userId);
//         break;
//       }
//     }
//   });
// });

// // Laravel → POST → here
// app.post('/notify', (req, res) => {
//     const data = req.body;
//     console.log('Notification from Laravel:', data);

//     // Broadcast to ALL connected clients
//     io.emit('action-update', data);

//     res.sendStatus(200);
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Socket.IO server running on port ${PORT}`);
// });


// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// const server = http.createServer(app);

// // Allow CORS for Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: "*", 
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Track connected users (userId → socketId)
// const connectedUsers = new Map();

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // Register a user after they connect
//   socket.on('register', (userId) => {
//     if (userId) {
//       connectedUsers.set(userId, socket.id);
//       console.log(`User ${userId} registered with socket ${socket.id}`);
//     }
//   });

//   // Handle manual notifications (not needed if you only use /notify)
//   socket.on('notification', (data) => {
//     console.log('Notification received:', data);
//     socket.broadcast.emit('new-notification', data);
//   });

//   // Example: broadcast action to all (not restricted)
//   socket.on('action', (data) => {
//     console.log('Action received:', data);
//     io.emit('action-update', data);
//   });

//   // Remove disconnected users
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     for (let [userId, socketId] of connectedUsers.entries()) {
//       if (socketId === socket.id) {
//         connectedUsers.delete(userId);
//         console.log(`Removed ${userId} from connectedUsers`);
//         break;
//       }
//     }
//   });
// });

// // Laravel → POST → /notify
// app.post('/notify', (req, res) => {
//   const data = req.body;
//   console.log('Notification from Laravel:', data);

//   const { user_id } = data;
//   if (user_id && connectedUsers.has(user_id)) {
//     const socketId = connectedUsers.get(user_id);
//     io.to(socketId).emit('action-update', data);
//     console.log(`Sent action-update to ${user_id} (${socketId})`);
//   } else {
//     console.log(`User ${user_id} not connected, skipping emit`);
//   }

//   res.sendStatus(200);
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Socket.IO server running on port ${PORT}`);
// });



const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store connected users (userId → socketId)
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Client registers their userId
  socket.on('register', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    }
  });

  // Clean up when user disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`🗑️ Removed ${userId} from connectedUsers`);
        break;
      }
    }
  });
});

// Laravel → POST → /notify
// app.post('/notify', (req, res) => {
//   // console.log('📩 Headers:', req.headers);   // 👈 Add here
//   // console.log('📩 Raw body:', JSON.stringify(req.body, null, 2));

//   // const data = JSON.stringify(req.body, null, 2);
//   // console.log('📩 Parsed body:', data);
//   // console.log('user id:', data.user_id);

//   console.log('📩 Raw body:', req.body); // object
//   const data = req.body; // keep it as an object
//   console.log('user id:', data.user_id);

//   if (!data || !data.user_id) {
//     console.log('❌ Invalid payload received');
//     return res.status(400).send('Invalid payload');
//   }

//   const { user_id } = data;

//   if (connectedUsers.has(user_id)) {
//     const socketId = connectedUsers.get(user_id);
//     io.to(socketId).emit('action-update-' + user_id, data);
//     console.log(`➡️ Sent action-update to ${user_id} (${socketId})`);
//   } else {
//     console.log(`⚠️ User ${user_id} not connected, skipping emit`);
//   }

//   res.sendStatus(200);
// });


app.post('/notify', (req, res) => {
  const data = req.body; // object
  console.log('📩 Received:', JSON.stringify(data, null, 2));
  
  const { user_id } = data;
  console.log('user id:', user_id);
  if (!user_id) {
    console.log('❌ Invalid payload received');
    return res.status(400).send('Invalid payload');
  }

  if (user_id) {
    // const socketId = connectedUsers.get(user_id);
    io.emit(`action-update-${user_id}`, data);
    console.log(`➡️ Broadcasted action-update-${user_id}`);
    // console.log(`➡️ Sent action-update to ${user_id} (${socketId})`);
  } else {
    console.log(`⚠️ User ${user_id} not connected, skipping emit`);
  }

  res.sendStatus(200);
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
