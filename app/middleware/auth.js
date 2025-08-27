const JWTUtils = require('../utils/jwt');
const User = require('../models/User');
const { Logger } = require('../utils/logger');

// 🛡️ MIDDLEWARE DE AUTENTICACIÓN
const authMiddleware = async (req, res, next) => {
  try {
    // 🔍 Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      Logger.auth('AUTH_FALLIDO', 'Header de autorización faltante o inválido');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: {
          code: 'MISSING_TOKEN'
        }
      });
    }
    
    // 🎫 Extraer token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      Logger.auth('AUTH_FALLIDO', 'Token no proporcionado');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: {
          code: 'MISSING_TOKEN'
        }
      });
    }
    
    // ✅ Verify token
    const decoded = JWTUtils.verifyToken(token);
    
    // 🔍 Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      Logger.auth('AUTH_FAILED', `User not found for token: ${decoded.email}`);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        error: {
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // 🔒 Check if user is active
    if (!user.isActive) {
      Logger.auth('AUTH_FAILED', `Inactive user attempted access: ${user.email}`);
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        error: {
          code: 'ACCOUNT_INACTIVE'
        }
      });
    }
    
    // ✅ Add user to request object
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;
    
    Logger.auth('AUTH_SUCCESS', `Authenticated request for: ${user.email}`);
    next();
    
  } catch (error) {
    Logger.auth('AUTH_ERROR', 'Authentication middleware error', error);
    
    // 🕐 Handle specific JWT errors
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicia sesión nuevamente',
        error: {
          code: 'TOKEN_EXPIRED'
        }
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: {
          code: 'INVALID_TOKEN'
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error de autenticación',
      error: {
        code: 'AUTH_ERROR'
      }
    });
  }
};

// 🔓 OPTIONAL AUTHENTICATION MIDDLEWARE (no requiere token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = JWTUtils.verifyToken(token);
          const user = await User.findById(decoded.userId);
          
          if (user && user.isActive) {
            req.user = user;
            req.token = token;
            req.tokenPayload = decoded;
            Logger.auth('OPTIONAL_AUTH_SUCCESS', `Optional auth for: ${user.email}`);
          }
        } catch (error) {
          // Si hay error en el token opcional, solo lo loggeamos pero continuamos
          Logger.auth('OPTIONAL_AUTH_FAILED', 'Optional auth failed, continuing without user');
        }
      }
    }
    
    next();
    
  } catch (error) {
    Logger.auth('OPTIONAL_AUTH_ERROR', 'Optional auth middleware error', error);
    next(); // Continuar sin autenticación
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
