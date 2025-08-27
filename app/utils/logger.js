// 🎨 Utilidad de Logger con Iconos Atractivos
// ═══════════════════════════════════════════════

// 📋 Configuración de Iconos de Log
const LOG_ICONS = {
  // 🔹 Acciones Generales
  start: '🚀',
  stop: '🛑',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  debug: '🐛',
  
  // 🔹 Métodos HTTP
  get: '📖',
  post: '➕',
  put: '✏️',
  patch: '🔧',
  delete: '🗑️',
  
  // 🔹 Operaciones de Base de Datos
  database: '🗄️',
  connecting: '🔄',
  connected: '🔌',
  disconnected: '📡',
  
  // 🔹 Autenticación y Seguridad
  auth: '🔐',
  login: '🚪',
  logout: '🚶‍♂️',
  token: '🎫',
  security: '🛡️',
  
  // 🔹 Operaciones Financieras
  money: '💰',
  investment: '📈',
  expense: '💸',
  income: '💵',
  transfer: '🔄',
  credit: '💳',
  
  // 🔹 Operaciones del Sistema
  config: '⚙️',
  file: '📄',
  folder: '📁',
  network: '🌐',
  time: '⏰'
};

// 🎯 Clase Logger
class Logger {
  
  // 🎨 Formatear mensaje de log con icono y timestamp
  static format(icon, level, message, data = null) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${icon} [${level.toUpperCase()}] ${timestamp} - ${message}`;
    
    if (data) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }
  
  // 📝 Métodos Básicos de Log
  static info(message, data) {
    this.format(LOG_ICONS.info, 'info', message, data);
  }
  
  static success(message, data) {
    this.format(LOG_ICONS.success, 'success', message, data);
  }
  
  static error(message, data) {
    this.format(LOG_ICONS.error, 'error', message, data);
  }
  
  static warning(message, data) {
    this.format(LOG_ICONS.warning, 'warning', message, data);
  }
  
  static debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.format(LOG_ICONS.debug, 'debug', message, data);
    }
  }
  
  // 🌐 Logger de Requests HTTP
  static httpRequest(method, path, statusCode, responseTime) {
    const icon = LOG_ICONS[method.toLowerCase()] || LOG_ICONS.info;
    const status = statusCode >= 400 ? '❌' : '✅';
    const message = `${method} ${path} ${status} ${statusCode} - ${responseTime}ms`;
    this.format(icon, 'http', message);
  }
  
  // 🗄️ Database Logger
  static database(action, message, data) {
    const icon = LOG_ICONS.database;
    this.format(icon, 'db', `${action}: ${message}`, data);
  }
  
  // 💰 Financial Logger
  static financial(action, message, data) {
    const icon = LOG_ICONS.money;
    this.format(icon, 'finance', `${action}: ${message}`, data);
  }
  
  // 🔐 Auth Logger
  static auth(action, message, data) {
    const icon = LOG_ICONS.auth;
    this.format(icon, 'auth', `${action}: ${message}`, data);
  }
  
  // 🌐 API Logger
  static api(action, message, data) {
    const icon = LOG_ICONS.network;
    this.format(icon, 'api', `${action}: ${message}`, data);
  }
  
  // 🔄 Request Logger
  static request(method, path, ip, userAgent) {
    const icon = LOG_ICONS[method.toLowerCase()] || LOG_ICONS.info;
    const message = `${method} ${path} - IP: ${ip}`;
    this.format(icon, 'request', message);
  }
  
  // 🎯 Application Startup Banner
  static startupBanner(port, environment) {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║              💰 PROYECTION API 💰                ║');
    console.log('║           Financial Management System             ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log(`║ 🚀 Server: http://localhost:${port}                    ║`);
    console.log(`║ 🌍 Environment: ${environment.padEnd(28)} ║`);
    console.log(`║ ⏰ Started: ${new Date().toLocaleString().padEnd(28)} ║`);
    console.log('║ 💼 Ready for financial operations!               ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('\n');
  }
  
  // 🛑 Shutdown Banner
  static shutdownBanner() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║              🛑 SHUTTING DOWN 🛑                  ║');
    console.log('║         Proyection API is stopping...            ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('\n');
  }
}

module.exports = { Logger, LOG_ICONS };
