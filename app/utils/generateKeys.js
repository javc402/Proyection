#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 🔐 JWT Key Generator for Proyection API

console.log('🔐 Generador de Claves JWT - Proyection');
console.log('=====================================\n');

// Generate different types of keys
const keys = {
  'JWT Secret (512 bits)': crypto.randomBytes(64).toString('hex'),
  'API Key (256 bits)': crypto.randomBytes(32).toString('hex'),
  'Session Secret (384 bits)': crypto.randomBytes(48).toString('hex'),
  'Base64 Secret': crypto.randomBytes(32).toString('base64'),
  'URL Safe Secret': crypto.randomBytes(32).toString('base64url')
};

// Display generated keys
Object.entries(keys).forEach(([name, key]) => {
  console.log(`🔑 ${name}:`);
  console.log(`   ${key}\n`);
});

// Option to update .env file
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('¿Quieres actualizar el archivo .env con la nueva JWT Secret? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    updateEnvFile(keys['JWT Secret (512 bits)']);
  } else {
    console.log('✅ Claves generadas. Copia manualmente la que necesites.');
  }
  readline.close();
});

function updateEnvFile(newSecret) {
  const envPath = path.join(__dirname, '.env');
  
  try {
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace JWT_SECRET line
      const updatedContent = envContent.replace(
        /JWT_SECRET=.*/,
        `JWT_SECRET=${newSecret}`
      );
      
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ Archivo .env actualizado con la nueva JWT Secret');
    } else {
      console.log('❌ Archivo .env no encontrado');
    }
  } catch (error) {
    console.error('❌ Error actualizando .env:', error.message);
  }
}
