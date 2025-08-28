const mongoose = require('mongoose');
const Bank = require('./models/Bank');
const Country = require('./models/Country');
require('dotenv').config();

async function migrateBanksToCountryId() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los bancos que tienen countryCode pero no countryId
    const banksToMigrate = await Bank.find({}).lean(); // usar .lean() para obtener datos sin el modelo

    console.log(`📊 Encontrados ${banksToMigrate.length} bancos para revisar`);

    for (const bank of banksToMigrate) {
      if (bank.countryCode && !bank.countryId) {
        // Buscar el país correspondiente por código ISO
        const country = await Country.findOne({ isoCode: bank.countryCode });
        
        if (country) {
          // Actualizar el banco con el countryId
          await Bank.findByIdAndUpdate(bank._id, {
            countryId: country._id,
            $unset: { countryCode: "" } // Eliminar el campo countryCode
          });
          console.log(`✅ Migrado banco: ${bank.name} (${bank.countryCode}) -> País: ${country.name}`);
        } else {
          console.log(`❌ No se encontró país para código: ${bank.countryCode} (Banco: ${bank.name})`);
        }
      } else if (bank.countryId) {
        console.log(`⏭️ Banco ya migrado: ${bank.name}`);
      } else {
        console.log(`⚠️ Banco sin countryCode: ${bank.name}`);
      }
    }

    console.log('🎉 Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrateBanksToCountryId();
