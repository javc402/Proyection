require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const { Logger } = require('./utils/logger');

// 🚀 Inicializar aplicación Express
const app = express();

// 🔌 Conectar a la Base de Datos
connectDB();

// 🛡️ Middleware de Seguridad y CORS
app.use(helmet()); // 🔒 Headers de seguridad
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 📝 Middleware de parsing del body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📊 Middleware de logging de requests
app.use((req, res, next) => {
  const start = Date.now();
  
  // 📝 Sobrescribir res.end para loggear tiempo de respuesta
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    Logger.httpRequest(req.method, req.path, res.statusCode, responseTime);
    originalEnd.apply(this, args);
  };
  
  next();
});

// 🏠 Rutas
app.get('/', (req, res) => {
  res.json({
    message: '💰 Proyection API - Gestión Financiera Personal',
    version: '1.0.0',
    status: '✅ running',
    timestamp: new Date().toISOString()
  });
});

// 🔐 Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 🛠️ Utilities routes
const utilitiesRoutes = require('./routes/utilities');
app.use('/api/utilities', utilitiesRoutes);

// 🩺 Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: '✅ OK',
    uptime: `⏱️ ${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: `🌍 ${process.env.NODE_ENV}`
  });
});

// 🚨 Global error handler
app.use((err, req, res, next) => {
  Logger.error(`Global error caught: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '🔒 Internal Server Error' 
    : `❌ ${err.message}`;
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// 🔍 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: `🚫 Route ${req.originalUrl} not found`
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  Logger.startupBanner(PORT, process.env.NODE_ENV || 'development');
  Logger.success(`Server started successfully on port ${PORT}`);
});

module.exports = app;
