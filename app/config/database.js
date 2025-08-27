const mongoose = require('mongoose');
const { Logger } = require('../utils/logger');

// 🗄️ Configuración de Conexión a la Base de Datos
const connectDB = async () => {
  try {
    Logger.database('CONECTANDO', 'Intentando conectar a MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    Logger.database('CONECTADO', `Conexión exitosa a ${conn.connection.host}`);
    Logger.database('INFO', `Nombre de la base de datos: ${conn.connection.name}`);
    
    // 📡 Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      Logger.database('ERROR', 'Error de conexión ocurrido', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      Logger.database('DESCONECTADO', 'Conexión de MongoDB perdida');
    });
    
    mongoose.connection.on('reconnected', () => {
      Logger.database('RECONECTADO', 'Conexión de MongoDB restaurada');
    });
    
    // 🛑 Cierre controlado
    process.on('SIGINT', async () => {
      Logger.shutdownBanner();
      Logger.database('CERRANDO', 'Cierre controlado iniciado...');
      await mongoose.connection.close();
      Logger.database('CLOSED', 'MongoDB connection closed successfully');
      process.exit(0);
    });
    
  } catch (error) {
    Logger.database('FAILED', 'MongoDB connection failed', {
      message: error.message,
      mongoUri: process.env.MONGO_URI ? 'Configured' : 'Missing'
    });
    Logger.error('Please check your MONGO_URI in .env file');
    process.exit(1);
  }
};

module.exports = connectDB;
