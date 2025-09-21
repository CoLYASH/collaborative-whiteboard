require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const ROLES = require('./roles');
const authRoutes = require('./auth');

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());
app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

const users = {};

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("register", ({ username, color, role }) => {
    const assignedRole = Object.keys(users).length === 0 ? ROLES.ADMIN : role || ROLES.WRITE;

    users[socket.id] = { 
      username, 
      color, 
      role: assignedRole,
      lastActive: new Date()
    };
    emitUsers();
  });

  socket.on("assignRole", ({ targetId, newRole }) => {
    const requestingUser = users[socket.id];
    
    // Only allow admins to change roles
    if (requestingUser?.role !== ROLES.ADMIN) {
      console.log(`Unauthorized role change attempt by ${requestingUser?.username}`);
      return;
    }

    const targetUser = users[targetId];
    if (targetUser) {
      // Prevent removing the last admin
      if (targetUser.role === ROLES.ADMIN && newRole !== ROLES.ADMIN) {
        const adminCount = Object.values(users).filter(u => u.role === ROLES.ADMIN).length;
        if (adminCount <= 1) {
          socket.emit("roleChangeError", {
            message: "Cannot remove the last admin"
          });
          return;
        }
      }

      targetUser.role = newRole;
      targetUser.lastActive = new Date();
      
      // Notify the target user
      io.to(targetId).emit("roleChanged", { 
        userId: targetId, 
        newRole 
      });
      
      emitUsers();
      console.log(`User ${targetUser.username} role changed to ${newRole} by ${requestingUser.username}`);
    }
  });

  socket.on("updateColor", ({ color }) => {
    if (users[socket.id]) {
      users[socket.id].color = color;
      users[socket.id].lastActive = new Date();
      emitUsers();
    }
  });

  socket.on("drawing", (data) => {
    const user = users[socket.id];
    if (user && (user.role === ROLES.WRITE || user.role === ROLES.ADMIN || user.role === ROLES.ERASE)) {
      socket.broadcast.emit("drawing", data);
      users[socket.id].lastActive = new Date();
    }
  });

  socket.on("clear", () => {
    const user = users[socket.id];
    if (user && (user.role === ROLES.ADMIN || user.role === ROLES.ERASE)) {
      io.emit("clear");
      console.log(`Canvas cleared by ${user.username}`);
      users[socket.id].lastActive = new Date();
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${users[socket.id]?.username || socket.id}`);
    delete users[socket.id];
    emitUsers();
  });

  function emitUsers() {
    const userList = Object.entries(users).map(([id, data]) => ({
      id,
      username: data.username,
      color: data.color,
      role: data.role,
      lastActive: data.lastActive
    }));
    io.emit("connectedUsers", userList);
  }

  // Cleanup inactive users every 5 minutes
  setInterval(() => {
    const now = new Date();
    Object.entries(users).forEach(([id, user]) => {
      if (now - user.lastActive > 300000) { // 5 minutes
        delete users[id];
        io.to(id).emit("inactiveDisconnect");
      }
    });
    emitUsers();
  }, 300000);
});

const PORT = process.env.PORT || 3001;
app.get("/test", (req, res) => {
  res.send("✅ Express is working");
});

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));