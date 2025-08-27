const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const { Logger } = require('../utils/logger');

// 🔐 CONTROLADOR DE AUTENTICACIÓN
class AuthController {
  
  // 🚀 ENDPOINT DE LOGIN
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      Logger.auth('INTENTO_LOGIN', `Intento de login para el email: ${email}`);
      
      // 📋 Validar datos de entrada
      if (!email || !password) {
        Logger.auth('LOGIN_FALLIDO', 'Faltan email o contraseña');
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
          error: {
            code: 'MISSING_CREDENTIALS',
            fields: {
              email: !email ? 'Email es requerido' : null,
              password: !password ? 'Contraseña es requerida' : null
            }
          }
        });
      }
      
      // 🔍 Buscar usuario por email e incluir password y campos necesarios
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password isActive firstName lastName currency _id email');
      
      if (!user) {
        Logger.auth('LOGIN_FALLIDO', `Usuario no encontrado: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          error: {
            code: 'INVALID_CREDENTIALS'
          }
        });
      }

      // 🔐 Verificar si la cuenta está activa
      if (!user.isActive) {
        Logger.auth('LOGIN_FALLIDO', `Cuenta inactiva: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada. Contactá al administrador',
          error: {
            code: 'ACCOUNT_INACTIVE'
          }
        });
      }
      
      // 🐛 DEBUG: Verificar datos del usuario
      console.log('🔍 DEBUG - Usuario encontrado:', {
        email: user.email,
        tienePassword: !!user.password,
        longitudPassword: user.password?.length || 0,
        isActive: user.isActive,
        passwordRecibida: password
      });
      
      // ✅ Verificar contraseña
      const isPasswordValid = await user.comparePassword(password);
      console.log('🔍 DEBUG - Resultado de comparación:', isPasswordValid);
      
      if (!isPasswordValid) {
        Logger.auth('LOGIN_FALLIDO', `Contraseña inválida para: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
          error: {
            code: 'INVALID_CREDENTIALS'
          }
        });
      }
      
      // 📅 Actualizar último login
      user.lastLogin = new Date();
      await user.save();
      
      // 🎫 Generar tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredCurrency: user.preferredCurrency
      };
      
      const accessToken = JWTUtils.generateAccessToken(tokenPayload);
      const refreshToken = JWTUtils.generateRefreshToken(tokenPayload);
      
      // 🎉 Respuesta de login exitoso
      Logger.auth('LOGIN_EXITOSO', `Login exitoso para: ${email}`);
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: user.getPublicProfile(),
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: '20m', // 20 minutos como solicitaste
            tokenType: 'Bearer'
          }
        }
      });
      
    } catch (error) {
      Logger.auth('ERROR', 'Error durante el proceso de login', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          ...(process.env.NODE_ENV !== 'production' && { details: error.message })
        }
      });
    }
  }
  
  // 🔄 ENDPOINT DE REFRESH TOKEN
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token es requerido',
          error: {
            code: 'MISSING_REFRESH_TOKEN'
          }
        });
      }
      
      // ✅ Verificar refresh token
      const decoded = JWTUtils.verifyToken(refreshToken);
      
      // 🔍 Buscar usuario
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo',
          error: {
            code: 'USER_NOT_FOUND'
          }
        });
      }
      
      // 🎫 Generar nuevo access token
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredCurrency: user.preferredCurrency
      };
      
      const newAccessToken = JWTUtils.generateAccessToken(tokenPayload);
      
      Logger.auth('TOKEN_RENOVADO', `Token renovado para: ${user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          accessToken: newAccessToken,
          expiresIn: '20m',
          tokenType: 'Bearer'
        }
      });
      
    } catch (error) {
      Logger.auth('ERROR', 'Error renovando token', error);
      
      if (error.message === 'Token expired' || error.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido o expirado',
          error: {
            code: 'INVALID_REFRESH_TOKEN'
          }
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  }
  
  // 🚪 ENDPOINT DE LOGOUT
  static async logout(req, res) {
    try {
      const user = req.user; // Viene del middleware de autenticación
      
      Logger.auth('LOGOUT', `Usuario cerró sesión: ${user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
      
    } catch (error) {
      Logger.auth('ERROR', 'Error durante el logout', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  }
  
  // 👤 OBTENER PERFIL DEL USUARIO ACTUAL
  static async getProfile(req, res) {
    try {
      const user = req.user; // Viene del middleware de autenticación
      
      Logger.auth('ACCESO_PERFIL', `Perfil accedido por: ${user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          user: user.getPublicProfile()
        }
      });
      
    } catch (error) {
      Logger.auth('ERROR', 'Error obteniendo perfil', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  }
}

module.exports = AuthController;
