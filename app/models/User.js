const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 👤 DEFINICIÓN DEL ESQUEMA DE USUARIO
const userSchema = new mongoose.Schema({
  // 📧 Información Básica
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresá un email válido'
    ]
  },
  
  // 🔐 Autenticación
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir la contraseña en queries por defecto
  },
  
  // 👨‍💼 Información del Perfil
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  
  // 📱 Datos Opcionales del Perfil
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Por favor ingresá un número de teléfono válido']
  },
  
  // 🎂 Información de Fecha
  dateOfBirth: {
    type: Date
  },
  
  // 🌍 Ubicación
  country: {
    type: String,
    trim: true
  },
  
  city: {
    type: String,
    trim: true
  },
  
  // 💰 Preferencias Financieras
  preferredCurrency: {
    type: String,
    enum: ['USD', 'EUR', 'COP', 'MXN', 'ARS', 'CLP', 'PEN'],
    default: 'USD'
  },
  
  // 🔒 Estado de la Cuenta
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // 📅 Marcas de Tiempo
  lastLogin: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 🔄 ACTUALIZAR TIMESTAMP AL GUARDAR
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 🔐 HASHEAR CONTRASEÑA ANTES DE GUARDAR
userSchema.pre('save', async function(next) {
  // Solo hashear la contraseña si ha sido modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password con costo de 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔍 MÉTODO PARA COMPARAR CONTRASEÑA
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 📝 MÉTODO PARA OBTENER PERFIL PÚBLICO
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// 📊 VIRTUAL PARA NOMBRE COMPLETO
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 🔍 ÍNDICES PARA RENDIMIENTO
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
