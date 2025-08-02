import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import { securityHeaders, generalLimiter, speedLimiter } from './middleware/security.js';
import marketDataService from './services/marketDataService.js';
import logger from './utils/logger.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);
app.use(speedLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trading Platform API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`Server started on port ${PORT}`);
  
  // Start market data service
  marketDataService.startRealTimeUpdates();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  marketDataService.stopRealTimeUpdates();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  marketDataService.stopRealTimeUpdates();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});