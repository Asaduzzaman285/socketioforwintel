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
