const express = require('express');
const router = express.Router();

// � IMPORTAR RUTAS ESPECÍFICAS DE MANAGEMENT
const bankAccountRoutes = require('./management/bankAccountRoutes');

// 🎯 RUTAS DE GESTIÓN
router.use('/bank-accounts', bankAccountRoutes);

module.exports = router;
