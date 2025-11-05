/**
 * RuuviTag Test Drive Tracker - API Server
 * Main entry point for the Express.js backend
 */

import express, { type Express } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import testDriveRoutes from './routes/testDrives';
import vehicleRoutes from './routes/vehicles';
import customerRoutes from './routes/customers';
import salespeopleRoutes from './routes/salespeople';
import ruuvitagRoutes from './routes/ruuvitag';
import analyticsRoutes from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocket } from './services/websocket';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/testdrives', testDriveRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/salespeople', salespeopleRoutes);
app.use('/api/ruuvitag', ruuvitagRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Setup WebSocket
setupWebSocket(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 RuuviTag API Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { io };
