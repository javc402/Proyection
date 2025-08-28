const mongoose = require('mongoose');

// 🏦 ESQUEMA DE BANCOS
const bankSchema = new mongoose.Schema({
  // 📝 Información Básica
  name: {
    type: String,
    required: [true, 'El nombre del banco es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  // 🏷️ Código identificador único
  code: {
    type: String,
    required: [true, 'El código del banco es requerido'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'El código no puede exceder 10 caracteres']
  },
  
  // 🎨 Información Visual
  icon: {
    type: String,
    required: [true, 'El icono del banco es requerido'],
    trim: true
  },
  
  logo: {
    type: String,
    trim: true,
    default: null
  },
  
  // 🌍 Ubicación
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: [true, 'El ID del país es requerido']
  },
  
  // 📞 Información de Contacto
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\//, 'El website debe ser una URL válida']
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  // 💳 Información Financiera
  bankingType: {
    type: String,
    enum: ['commercial', 'investment', 'central', 'cooperative', 'digital'],
    default: 'commercial'
  },
  
  supportsInternational: {
    type: Boolean,
    default: false
  },
  
  // 🔒 Estado y Control
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPopular: {
    type: Boolean,
    default: false
  },
  
  // 📊 Metadatos
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // 📅 Marcas de Tiempo
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
bankSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 🔍 ÍNDICES PARA RENDIMIENTO
bankSchema.index({ countryCode: 1, isActive: 1 });
bankSchema.index({ code: 1 }, { unique: true });
bankSchema.index({ name: 1 });
bankSchema.index({ displayOrder: 1 });

// 📝 MÉTODO PARA OBTENER INFORMACIÓN PÚBLICA
bankSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    name: this.name,
    code: this.code,
    icon: this.icon,
    logo: this.logo,
    countryCode: this.countryCode,
    website: this.website,
    bankingType: this.bankingType,
    supportsInternational: this.supportsInternational,
    isPopular: this.isPopular
  };
};

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;
