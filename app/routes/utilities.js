const express = require('express');
const router = express.Router();

// 🏦 IMPORTAR RUTAS ESPECÍFICAS DE UTILITIES
const bankRoutes = require('./utilities/bankRoutes');
const countryRoutes = require('./utilities/countryRoutes');

// � RUTAS DE UTILIDADES
router.use('/banks', bankRoutes);
router.use('/countries', countryRoutes);

module.exports = router;
