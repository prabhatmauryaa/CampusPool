require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

const http = require('http');
// Route imports
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { initSocket } = require('./socket');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize real-time Socket.IO server
initSocket(httpServer);

// Middleware
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CampusPool Backend API',
    institution: 'KIET Group of Institutions',
    team: 'CampusPool — KIET Group of Institutions',
    allowedDomain: '@kiet.edu',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  });
});

// Start Server after connecting to DB
async function startServer() {
  try {
    await connectDB();

    // Auto-seed demo records if DB is completely empty (e.g. in-memory or fresh local DB)
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial KIET demonstration records...');
      const seedData = require('./seed');
      await seedData(false);
    }

    httpServer.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 CampusPool API Server listening on port ${PORT}`);
      console.log(`🎓 College Domain Restricted: @kiet.edu`);
      console.log(`💬 Real-Time Chat (Socket.IO): Enabled`);
      console.log(`🌐 Allowed Frontend Origin: ${FRONTEND_URL}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
