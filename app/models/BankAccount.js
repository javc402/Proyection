const mongoose = require('mongoose');

// 💳 ESQUEMA DE CUENTAS BANCARIAS
const bankAccountSchema = new mongoose.Schema({
  // 👤 Usuario propietario
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del usuario es requerido'],
    ref: 'User'
  },
  
  // 🌍 País de la cuenta
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del país es requerido'],
    ref: 'Country'
  },
  
  // 🏦 Banco de la cuenta
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del banco es requerido'],
    ref: 'Bank'
  },
  
  // 📝 Información de la cuenta
  name: {
    type: String,
    required: [true, 'El nombre de la cuenta es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  
  // 💰 Información financiera
  currentAmount: {
    type: Number,
    required: [true, 'El monto actual es requerido'],
    default: 0
  },
  
  // 💱 Moneda
  currency: {
    type: String,
    uppercase: true,
    length: [3, 'El código de moneda debe tener exactamente 3 caracteres'],
    match: [/^[A-Z]{3}$/, 'El código de moneda debe ser ISO 4217'],
    default: 'USD'
  },
  
  // 🔢 Número de cuenta (opcional para mostrar)
  accountNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'El número de cuenta no puede exceder 50 caracteres']
  },
  
  // 📊 Estado de la cuenta
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 🗑️ Borrado lógico
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // 📅 Metadatos de tiempo
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  // 📝 Configuración del schema
  timestamps: true, // Maneja automáticamente createdAt y updatedAt
  versionKey: false,
  
  // 🔄 Transformaciones JSON
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// 📚 ÍNDICES PARA OPTIMIZACIÓN
bankAccountSchema.index({ userId: 1, isDeleted: 1 });
bankAccountSchema.index({ countryId: 1, bankId: 1 });
bankAccountSchema.index({ isActive: 1, isDeleted: 1 });
bankAccountSchema.index({ createdAt: -1 });

// 🔍 MIDDLEWARE PRE-SAVE
bankAccountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 🔍 MIDDLEWARE PRE-FIND (para borrado lógico)
bankAccountSchema.pre(/^find/, function(next) {
  // Solo incluir documentos no eliminados por defecto
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// 📊 MÉTODOS ESTÁTICOS

// Obtener cuentas activas de un usuario
bankAccountSchema.statics.getActiveAccounts = function(userId) {
  return this.find({
    userId: userId,
    isActive: true,
    isDeleted: false
  }).populate('userId', 'firstName lastName email');
};

// Obtener todas las cuentas de un usuario (incluyendo inactivas)
bankAccountSchema.statics.getAllUserAccounts = function(userId) {
  return this.find({
    userId: userId,
    isDeleted: false
  }).populate('userId', 'firstName lastName email');
};

// Verificar si existe una cuenta con el mismo banco para un usuario
bankAccountSchema.statics.checkDuplicateAccount = function(userId, bankId, excludeId = null) {
  const query = {
    userId: userId,
    bankId: bankId,
    isDeleted: false
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.findOne(query);
};

// 📊 MÉTODOS DE INSTANCIA

// Activar cuenta
bankAccountSchema.methods.activate = function() {
  this.isActive = true;
  this.updatedAt = new Date();
  return this.save();
};

// Desactivar cuenta
bankAccountSchema.methods.deactivate = function() {
  this.isActive = false;
  this.updatedAt = new Date();
  return this.save();
};

// Borrado lógico
bankAccountSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Restaurar cuenta eliminada
bankAccountSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  this.updatedAt = new Date();
  return this.save();
};

// Actualizar monto
bankAccountSchema.methods.updateAmount = function(newAmount) {
  this.currentAmount = newAmount;
  this.updatedAt = new Date();
  return this.save();
};

// 🎯 VIRTUALS

// Obtener información completa del país
bankAccountSchema.virtual('country', {
  ref: 'Country',
  localField: 'countryId',
  foreignField: '_id',
  justOne: true
});

// Obtener información completa del banco
bankAccountSchema.virtual('bank', {
  ref: 'Bank',
  localField: 'bankId',
  foreignField: '_id',
  justOne: true
});

// Obtener información del usuario
bankAccountSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Estado descriptivo
bankAccountSchema.virtual('status').get(function() {
  if (this.isDeleted) return 'deleted';
  if (!this.isActive) return 'inactive';
  return 'active';
});

// Formato de moneda
bankAccountSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.currentAmount);
});

// 📝 VALIDACIONES PERSONALIZADAS

// Validar que el monto sea un número válido
bankAccountSchema.path('currentAmount').validate(function(value) {
  return !isNaN(value) && isFinite(value);
}, 'El monto debe ser un número válido');

// 🏷️ EXPORTAR EL MODELO
const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
