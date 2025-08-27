const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { Logger } = require('./logger');

// 🔐 UTILIDADES JWT
class JWTUtils {
  
  // 🎫 GENERAR ACCESS TOKEN (20 minutos)
  static generateAccessToken(payload) {
    try {
      // Asegurar que el payload contiene los campos requeridos
      if (!payload.email || !payload.userId) {
        throw new Error('Email y userId son requeridos en el payload');
      }

      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        type: 'access_token',
        iat: Math.floor(Date.now() / 1000)
      };

      const token = jwt.sign(
        tokenPayload,
        jwtConfig.secret,
        jwtConfig.getSignOptions()
      );
      
      Logger.auth('TOKEN_GENERADO', `Access token generado para el usuario: ${payload.email}`);
      return token;
    } catch (error) {
      Logger.auth('ERROR', 'Error generando access token', error);
      throw new Error('Error generando token');
    }
  }
  
  // 🔄 GENERAR REFRESH TOKEN (7 días)
  static generateRefreshToken(payload) {
    try {
      const refreshTokenPayload = {
        userId: payload.userId,
        email: payload.email,
        type: 'refresh_token',
        iat: Math.floor(Date.now() / 1000)
      };

      const token = jwt.sign(
        refreshTokenPayload,
        jwtConfig.secret,
        {
          expiresIn: '7d',
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience,
          algorithm: jwtConfig.algorithm
        }
      );
      
      Logger.auth('REFRESH_TOKEN_GENERADO', `Refresh token generado para el usuario: ${payload.email}`);
      return token;
    } catch (error) {
      Logger.auth('ERROR', 'Error generando refresh token', error);
      throw new Error('Error generando refresh token');
    }
  }
  
  // ✅ VERIFICAR TOKEN
  static verifyToken(token) {
    try {
      if (!token) {
        throw new Error('Token es requerido');
      }

      // Remover prefijo Bearer si está presente
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      
      const decoded = jwt.verify(cleanToken, jwtConfig.secret, jwtConfig.getVerifyOptions());
      
      Logger.auth('TOKEN_VERIFICADO', `Token verificado para el usuario: ${decoded.email}`);
      return decoded;
    } catch (error) {
      Logger.auth('TOKEN_INVALIDO', 'Verificación de token falló', error);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token aún no activo');
      }
      
      throw new Error('Verificación de token falló');
    }
  }
  
  // 📊 DECODE TOKEN WITHOUT VERIFICATION (for debugging)
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      Logger.auth('ERROR', 'Error decoding token', error);
      return null;
    }
  }
  
  // ⏰ GET TOKEN EXPIRATION TIME
  static getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.payload && decoded.payload.exp) {
        return new Date(decoded.payload.exp * 1000);
      }
      return null;
    } catch (error) {
      Logger.auth('ERROR', 'Error getting token expiration', error);
      return null;
    }
  }
  
  // 🔍 CHECK IF TOKEN IS EXPIRED
  static isTokenExpired(token) {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      
      return Date.now() >= expiration.getTime();
    } catch (error) {
      Logger.auth('ERROR', 'Error checking token expiration', error);
      return true;
    }
  }
}

module.exports = JWTUtils;
