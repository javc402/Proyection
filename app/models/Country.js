const mongoose = require('mongoose');

// 🌍 ESQUEMA DE PAÍSES
const countrySchema = new mongoose.Schema({
  // 📝 Información Básica
  name: {
    type: String,
    required: [true, 'El nombre del país es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  
  nativeName: {
    type: String,
    trim: true,
    maxlength: [100, 'El nombre nativo no puede exceder 100 caracteres']
  },
  
  // 🏷️ Códigos Identificadores
  isoCode: {
    type: String,
    required: [true, 'El código ISO es requerido'],
    unique: true,
    uppercase: true,
    length: [2, 'El código ISO debe tener exactamente 2 caracteres'],
    match: [/^[A-Z]{2}$/, 'El código ISO debe ser ISO 3166-1 alpha-2']
  },
  
  iso3Code: {
    type: String,
    uppercase: true,
    length: [3, 'El código ISO3 debe tener exactamente 3 caracteres'],
    match: [/^[A-Z]{3}$/, 'El código ISO3 debe ser ISO 3166-1 alpha-3']
  },
  
  numericCode: {
    type: String,
    length: [3, 'El código numérico debe tener exactamente 3 dígitos'],
    match: [/^[0-9]{3}$/, 'El código numérico debe contener solo números']
  },
  
  // 🎌 Información Visual
  flag: {
    type: String,
    required: [true, 'La bandera es requerida'],
    trim: true
  },
  
  flagEmoji: {
    type: String,
    trim: true
  },
  
  // 🌎 Información Geográfica
  continent: {
    type: String,
    enum: ['AF', 'AS', 'EU', 'NA', 'OC', 'SA', 'AN'],
    required: [true, 'El continente es requerido']
  },
  
  region: {
    type: String,
    trim: true
  },
  
  subregion: {
    type: String,
    trim: true
  },
  
  // 💰 Información Financiera
  currency: {
    code: {
      type: String,
      uppercase: true,
      length: [3, 'El código de moneda debe tener exactamente 3 caracteres']
    },
    name: {
      type: String,
      trim: true
    },
    symbol: {
      type: String,
      trim: true
    }
  },
  
  // 🏛️ Información Política
  capital: {
    type: String,
    trim: true
  },
  
  // 📞 Información de Contacto
  callingCode: {
    type: String,
    trim: true,
    match: [/^\+[0-9]+$/, 'El código de llamada debe empezar con + seguido de números']
  },
  
  // 🌐 Información Digital
  topLevelDomain: {
    type: String,
    trim: true,
    match: [/^\.[a-z]{2,}$/, 'El dominio debe empezar con punto seguido de letras']
  },
  
  // 🕒 Información de Zona Horaria
  timezones: [{
    type: String,
    trim: true
  }],
  
  // 🗣️ Idiomas
  languages: [{
    code: {
      type: String,
      uppercase: true,
      length: [2, 'El código de idioma debe tener exactamente 2 caracteres']
    },
    name: {
      type: String,
      trim: true
    },
    nativeName: {
      type: String,
      trim: true
    }
  }],
  
  // 🔒 Estado y Control
  isActive: {
    type: Boolean,
    default: true
  },
  
  isSupported: {
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
countrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 🔍 ÍNDICES PARA RENDIMIENTO
countrySchema.index({ isoCode: 1 }, { unique: true });
countrySchema.index({ isActive: 1, isSupported: 1 });
countrySchema.index({ continent: 1 });
countrySchema.index({ displayOrder: 1 });

// 📝 MÉTODO PARA OBTENER INFORMACIÓN PÚBLICA
countrySchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    name: this.name,
    nativeName: this.nativeName,
    isoCode: this.isoCode,
    iso3Code: this.iso3Code,
    flag: this.flag,
    flagEmoji: this.flagEmoji,
    continent: this.continent,
    region: this.region,
    currency: this.currency,
    capital: this.capital,
    callingCode: this.callingCode,
    languages: this.languages
  };
};

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
