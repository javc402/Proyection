const express = require('express');
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { Logger } = require('../utils/logger');

const router = express.Router();

// 🔐 RUTAS DE AUTENTICACIÓN

// 🚀 RUTA DE LOGIN
router.post('/login', async (req, res) => {
  Logger.api('RUTA', `POST /auth/login - ${req.ip}`);
  await AuthController.login(req, res);
});

// 🔄 RUTA DE REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  Logger.api('RUTA', `POST /auth/refresh - ${req.ip}`);
  await AuthController.refreshToken(req, res);
});

// 🚪 RUTA DE LOGOUT (requiere autenticación)
router.post('/logout', authMiddleware, async (req, res) => {
  Logger.api('RUTA', `POST /auth/logout - ${req.ip} - Usuario: ${req.user.email}`);
  await AuthController.logout(req, res);
});

// 👤 RUTA OBTENER PERFIL (requiere autenticación)
router.get('/profile', authMiddleware, async (req, res) => {
  Logger.api('RUTA', `GET /auth/profile - ${req.ip} - Usuario: ${req.user.email}`);
  await AuthController.getProfile(req, res);
});

// 🧪 TEST TOKEN ROUTE (para debugging)
router.get('/test', authMiddleware, async (req, res) => {
  Logger.api('ROUTE', `GET /auth/test - ${req.ip} - User: ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: '🎉 Token válido! Acceso autorizado',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName
      },
      tokenInfo: {
        issuedAt: new Date(req.tokenPayload.iat * 1000),
        expiresAt: new Date(req.tokenPayload.exp * 1000),
        timeRemaining: Math.round((req.tokenPayload.exp * 1000 - Date.now()) / 1000 / 60) + ' minutos'
      }
    }
  });
});

module.exports = router;
