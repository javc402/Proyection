// 🔐 Módulo de Configuración JWT
const crypto = require('crypto');

// Validar JWT Secret
const validateJWTSecret = (secret) => {
  if (!secret) {
    throw new Error('❌ JWT_SECRET es requerido');
  }
  
  if (secret.length < 32) {
    console.warn('⚠️  JWT_SECRET es muy corto. Recomendado: al menos 32 caracteres');
  }
  
  if (secret === 'your-secret-key' || secret.includes('changeme')) {
    throw new Error('❌ Por favor cambiá el JWT_SECRET por defecto en producción');
  }
  
  return true;
};

// Objeto de Configuración JWT
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '20m',
  issuer: 'proyection-api',
  audience: 'proyection-client', // Mantener consistente
  
  // Opciones de seguridad
  algorithm: 'HS256',
  noTimestamp: false,
  clockTolerance: 60, // 60 segundos
  
  // Validar configuración
  validate() {
    validateJWTSecret(this.secret);
    return true;
  },
  
  // Generar nuevo secret (para desarrollo)
  generateSecret() {
    return crypto.randomBytes(64).toString('hex');
  },
  
  // Obtener opciones de firma
  getSignOptions() {
    return {
      expiresIn: this.expiresIn,
      issuer: this.issuer,
      audience: this.audience,
      algorithm: this.algorithm,
      noTimestamp: this.noTimestamp
    };
  },
  
  // Obtener opciones de verificación
  getVerifyOptions() {
    return {
      issuer: this.issuer,
      audience: this.audience,
      algorithms: [this.algorithm],
      clockTolerance: this.clockTolerance,
      ignoreExpiration: false,
      ignoreNotBefore: false
    };
  }
};

// Inicializar y validar
try {
  jwtConfig.validate();
  console.log('🔐 Configuración JWT validada exitosamente');
} catch (error) {
  console.error('❌ Error en configuración JWT:', error.message);
  process.exit(1);
}

module.exports = jwtConfig;
