require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/database');
const User = require('./models/User');
const { OAuth2Client } = require('google-auth-library');
const WebSocket = require('ws');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Initialize Firebase Admin
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });
const clients = new Map(); // userId -> WebSocket

// Routes
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const notificationRoutes = require('./routes/notifications');

// app.use('/api/auth', authRoutes);
// app.use('/api/otp', otpRoutes);
// app.use('/api/notifications', notificationRoutes);

// Upgrade HTTP server to WebSocket
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection handler
wss.on('connection', (ws, request) => {
  const userId = request.url.split('=')[1]; // Simple example - use proper auth in production
  clients.set(userId, ws);
  
  ws.on('close', () => {
    clients.delete(userId);
  });
});

module.exports = { app, wss, clients };