const express = require('express');
const bankController = require('../controllers/utilities/bankController');
const countryController = require('../controllers/utilities/countryController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 🔐 TODAS LAS RUTAS DE UTILIDADES REQUIEREN AUTENTICACIÓN
router.use(authMiddleware);

// 🏦 RUTAS DE BANCOS
router.get('/banks', bankController.getAllBanks);
router.get('/banks/popular', bankController.getPopularBanks);
router.get('/banks/search', bankController.searchBanks);
router.get('/banks/stats', bankController.getBankStats);
router.get('/banks/country/:countryCode', bankController.getBanksByCountry);

// 🌍 RUTAS DE PAÍSES
router.get('/countries', countryController.getAllCountries);
router.get('/countries/supported', countryController.getSupportedCountries);
router.get('/countries/search', countryController.searchCountries);
router.get('/countries/stats', countryController.getCountryStats);
router.get('/countries/continent/:continentCode', countryController.getCountriesByContinent);
router.get('/countries/:isoCode', countryController.getCountryByIsoCode);

module.exports = router;
