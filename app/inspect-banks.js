const mongoose = require('mongoose');
const Bank = require('./models/Bank');
require('dotenv').config();

async function inspectBanks() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener algunos bancos para ver su estructura
    const banks = await Bank.find().limit(3);
    
    console.log('📊 Estructura de bancos en la base de datos:');
    banks.forEach((bank, index) => {
      console.log(`\n${index + 1}. ${bank.name}:`);
      console.log('   ID:', bank._id);
      console.log('   Code:', bank.code);
      console.log('   CountryCode:', bank.countryCode);
      console.log('   CountryId:', bank.countryId);
      console.log('   Objeto completo:', JSON.stringify(bank, null, 2));
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectBanks();
