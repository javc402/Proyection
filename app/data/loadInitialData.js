const mongoose = require('mongoose');
const Bank = require('../models/Bank');
const Country = require('../models/Country');
const bankData = require('./banks.json');
const countryData = require('./countries.json');
const { Logger } = require('../utils/logger');
require('dotenv').config();

// 🌍 SCRIPT PARA CARGAR DATOS INICIALES DE BANCOS Y PAÍSES

/**
 * 🏦 Cargar datos de bancos
 */
const loadBanks = async () => {
  try {
    Logger.info('🏦 Iniciando carga de datos de bancos...');
    
    // 🗑️ Limpiar colección existente
    await Bank.deleteMany({});
    Logger.info('🧹 Colección de bancos limpiada');
    
    // 📝 Insertar nuevos datos
    const banks = await Bank.insertMany(bankData);
    Logger.success(`✅ ${banks.length} bancos cargados exitosamente`);
    
    // 📊 Mostrar estadísticas
    const stats = await Bank.aggregate([
      {
        $group: {
          _id: '$countryCode',
          count: { $sum: 1 },
          popular: { 
            $sum: { $cond: ['$isPopular', 1, 0] } 
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    Logger.info('📊 Estadísticas de bancos por país:');
    stats.forEach(stat => {
      Logger.info(`   ${stat._id}: ${stat.count} bancos (${stat.popular} populares)`);
    });
    
    return banks;
    
  } catch (error) {
    Logger.error('❌ Error al cargar bancos:', error.message);
    throw error;
  }
};

/**
 * 🌍 Cargar datos de países
 */
const loadCountries = async () => {
  try {
    Logger.info('🌍 Iniciando carga de datos de países...');
    
    // 🗑️ Limpiar colección existente
    await Country.deleteMany({});
    Logger.info('🧹 Colección de países limpiada');
    
    // 📝 Insertar nuevos datos
    const countries = await Country.insertMany(countryData);
    Logger.success(`✅ ${countries.length} países cargados exitosamente`);
    
    // 📊 Mostrar estadísticas
    const stats = await Country.aggregate([
      {
        $group: {
          _id: '$continent',
          count: { $sum: 1 },
          supported: { 
            $sum: { $cond: ['$isSupported', 1, 0] } 
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    Logger.info('📊 Estadísticas de países por continente:');
    stats.forEach(stat => {
      Logger.info(`   ${stat._id}: ${stat.count} países (${stat.supported} soportados)`);
    });
    
    // 🌟 Mostrar países soportados
    const supportedCountries = await Country.find({ isSupported: true })
      .select('name isoCode flagEmoji')
      .sort({ displayOrder: 1 });
    
    Logger.info('🌟 Países soportados:');
    supportedCountries.forEach(country => {
      Logger.info(`   ${country.flagEmoji} ${country.name} (${country.isoCode})`);
    });
    
    return countries;
    
  } catch (error) {
    Logger.error('❌ Error al cargar países:', error.message);
    throw error;
  }
};

/**
 * 🚀 Función principal
 */
const loadInitialData = async () => {
  try {
    Logger.info('🚀 Iniciando carga de datos iniciales...');
    
    // 🔌 Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    Logger.success('✅ Conectado a MongoDB');
    
    // 📊 Cargar datos
    const [banks, countries] = await Promise.all([
      loadBanks(),
      loadCountries()
    ]);
    
    Logger.success('🎉 ¡Datos iniciales cargados exitosamente!');
    Logger.info(`📊 Resumen: ${countries.length} países y ${banks.length} bancos`);
    
    // 🔌 Cerrar conexión
    await mongoose.connection.close();
    Logger.info('🔌 Conexión a MongoDB cerrada');
    
    process.exit(0);
    
  } catch (error) {
    Logger.error('💥 Error crítico al cargar datos:', error.message);
    process.exit(1);
  }
};

/**
 * 🔄 Función para actualizar datos sin limpiar
 */
const updateData = async () => {
  try {
    Logger.info('🔄 Iniciando actualización de datos...');
    
    // 🔌 Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    Logger.success('✅ Conectado a MongoDB');
    
    // 🏦 Actualizar bancos
    for (const bankInfo of bankData) {
      await Bank.findOneAndUpdate(
        { code: bankInfo.code },
        bankInfo,
        { upsert: true, new: true }
      );
    }
    Logger.success('✅ Bancos actualizados');
    
    // 🌍 Actualizar países
    for (const countryInfo of countryData) {
      await Country.findOneAndUpdate(
        { isoCode: countryInfo.isoCode },
        countryInfo,
        { upsert: true, new: true }
      );
    }
    Logger.success('✅ Países actualizados');
    
    Logger.success('🎉 ¡Datos actualizados exitosamente!');
    
    // 🔌 Cerrar conexión
    await mongoose.connection.close();
    Logger.info('🔌 Conexión a MongoDB cerrada');
    
    process.exit(0);
    
  } catch (error) {
    Logger.error('💥 Error al actualizar datos:', error.message);
    process.exit(1);
  }
};

// 📝 Detectar modo de ejecución
const mode = process.argv[2];

if (mode === 'update') {
  updateData();
} else {
  loadInitialData();
}

module.exports = {
  loadBanks,
  loadCountries,
  loadInitialData,
  updateData
};
