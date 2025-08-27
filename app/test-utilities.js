// 🧪 SCRIPT DE PRUEBAS RÁPIDAS PARA APIS DE UTILIDADES
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

// 🎨 Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

// 🔐 Función para autenticarse
const authenticate = async () => {
  try {
    log.test('Autenticando usuario...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@proyection.com',
      password: 'password123'
    });
    
    if (response.data.success) {
      authToken = response.data.data.tokens.accessToken;
      log.success('Autenticación exitosa');
      return true;
    }
    
    log.error('Fallo en autenticación');
    return false;
  } catch (error) {
    log.error(`Error en autenticación: ${error.message}`);
    return false;
  }
};

// 🧪 Función para hacer peticiones autenticadas
const authRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// 🧪 Pruebas de APIs de Bancos
const testBankAPIs = async () => {
  log.test('=== PROBANDO APIs DE BANCOS ===');
  
  try {
    // 📋 Todos los bancos
    log.test('Obteniendo todos los bancos...');
    const allBanks = await authRequest('GET', '/api/utilities/banks?limit=5');
    log.success(`Bancos obtenidos: ${allBanks.data.data.banks.length}`);
    
    // 🌍 Bancos por país
    log.test('Obteniendo bancos de Colombia...');
    const colombianBanks = await authRequest('GET', '/api/utilities/banks/country/CO');
    log.success(`Bancos colombianos: ${colombianBanks.data.data.banks.length}`);
    
    // ⭐ Bancos populares
    log.test('Obteniendo bancos populares...');
    const popularBanks = await authRequest('GET', '/api/utilities/banks/popular?limit=3');
    log.success(`Bancos populares: ${popularBanks.data.data.banks.length}`);
    
    // 🔍 Búsqueda
    log.test('Buscando "bancolombia"...');
    const searchBanks = await authRequest('GET', '/api/utilities/banks/search?q=bancolombia');
    log.success(`Resultados búsqueda: ${searchBanks.data.data.banks.length}`);
    
    // 📊 Estadísticas
    log.test('Obteniendo estadísticas de bancos...');
    const bankStats = await authRequest('GET', '/api/utilities/banks/stats');
    log.success(`Total bancos: ${bankStats.data.data.stats.total}`);
    
  } catch (error) {
    log.error(`Error en pruebas de bancos: ${error.message}`);
  }
};

// 🧪 Pruebas de APIs de Países
const testCountryAPIs = async () => {
  log.test('=== PROBANDO APIs DE PAÍSES ===');
  
  try {
    // 📋 Todos los países
    log.test('Obteniendo todos los países...');
    const allCountries = await authRequest('GET', '/api/utilities/countries?limit=5');
    log.success(`Países obtenidos: ${allCountries.data.data.countries.length}`);
    
    // 🌟 Países soportados
    log.test('Obteniendo países soportados...');
    const supportedCountries = await authRequest('GET', '/api/utilities/countries/supported');
    log.success(`Países soportados: ${supportedCountries.data.data.countries.length}`);
    
    // 🌎 Países por continente
    log.test('Obteniendo países de Sudamérica...');
    const saCountries = await authRequest('GET', '/api/utilities/countries/continent/SA');
    log.success(`Países SA: ${saCountries.data.data.countries.length}`);
    
    // 🔍 País por código ISO
    log.test('Obteniendo información de Colombia...');
    const colombia = await authRequest('GET', '/api/utilities/countries/CO');
    log.success(`País encontrado: ${colombia.data.data.country.name}`);
    
    // 🔍 Búsqueda
    log.test('Buscando "colombia"...');
    const searchCountries = await authRequest('GET', '/api/utilities/countries/search?q=colombia');
    log.success(`Resultados búsqueda: ${searchCountries.data.data.countries.length}`);
    
    // 📊 Estadísticas
    log.test('Obteniendo estadísticas de países...');
    const countryStats = await authRequest('GET', '/api/utilities/countries/stats');
    log.success(`Total países: ${countryStats.data.data.stats.total}`);
    
  } catch (error) {
    log.error(`Error en pruebas de países: ${error.message}`);
  }
};

// 🚀 Función principal
const runTests = async () => {
  console.log('\n🚀 INICIANDO PRUEBAS DE APIs DE UTILIDADES\n');
  
  // 🔐 Autenticar
  const isAuthenticated = await authenticate();
  if (!isAuthenticated) {
    log.error('No se pudo autenticar. Finalizando pruebas.');
    return;
  }
  
  console.log('');
  
  // 🧪 Ejecutar pruebas
  await testBankAPIs();
  console.log('');
  await testCountryAPIs();
  
  console.log('\n🎉 PRUEBAS COMPLETADAS\n');
};

// 📝 Ejecutar si es llamado directamente
if (require.main === module) {
  runTests().catch(error => {
    log.error(`Error crítico: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
