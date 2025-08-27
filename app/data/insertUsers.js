#!/usr/bin/env node

// 🗄️ SCRIPT PARA INSERTAR USUARIOS EN MONGODB
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { Logger } = require('../utils/logger');

// 📊 Datos de usuarios
const users = require('./users.json');

async function insertUsers() {
  try {
    Logger.startupBanner();
    Logger.database('CONNECTING', 'Connecting to MongoDB for user insertion...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    Logger.database('CONNECTED', 'Successfully connected to MongoDB');
    
    // Verificar si ya existen usuarios
    const existingUsersCount = await User.countDocuments();
    
    if (existingUsersCount > 0) {
      Logger.database('WARNING', `Found ${existingUsersCount} existing users`);
      
      // Preguntar si quiere continuar
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        readline.question('❓ ¿Quieres eliminar usuarios existentes y crear nuevos? (y/n): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await User.deleteMany({});
        Logger.database('DELETED', 'All existing users removed');
      } else {
        Logger.database('CANCELLED', 'Operation cancelled by user');
        process.exit(0);
      }
    }
    
    // Insertar usuarios
    Logger.database('INSERTING', `Inserting ${users.length} users...`);
    
    const insertedUsers = await User.insertMany(users);
    
    Logger.database('SUCCESS', `✅ Successfully inserted ${insertedUsers.length} users`);
    
    // Mostrar resumen
    console.log('\n📋 USUARIOS CREADOS:');
    console.log('=====================');
    
    for (const user of insertedUsers) {
      console.log(`👤 ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   🌍 Country: ${user.country}`);
      console.log(`   💰 Currency: ${user.currency}`);
      console.log(`   ✅ Active: ${user.isActive ? 'Sí' : 'No'}`);
      console.log('   ---');
    }
    
    console.log('\n🔐 CREDENCIALES DE PRUEBA:');
    console.log('==========================');
    console.log('📧 Email: admin@proyection.com');
    console.log('🔑 Password: password123');
    console.log('👤 Role: admin');
    console.log('\n📧 Email: juan.perez@gmail.com');
    console.log('🔑 Password: password123');
    console.log('👤 Role: user');
    
    Logger.database('COMPLETED', 'User insertion completed successfully');
    
  } catch (error) {
    Logger.database('ERROR', 'Failed to insert users', error);
    console.error('❌ Error details:', error.message);
  } finally {
    await mongoose.connection.close();
    Logger.database('DISCONNECTED', 'MongoDB connection closed');
    process.exit(0);
  }
}

// Ejecutar script
if (require.main === module) {
  insertUsers();
}

module.exports = { insertUsers };
