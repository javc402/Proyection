const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const countryController = require('../../controllers/utilities/countryController');

// 🔐 Todas las rutas requieren autenticación
router.use(authMiddleware);

// 🌍 RUTAS DE PAÍSES

/**
 * @route   GET /api/utilities/countries
 * @desc    Obtener todos los países disponibles
 * @access  Private
 * @query   {
 *   page?: number - Número de página (default: 1)
 *   limit?: number - Límite de resultados por página (default: 50)
 *   continent?: string - Filtrar por continente
 * }
 */
router.get('/', countryController.getAllCountries);

/**
 * @route   GET /api/utilities/countries/supported
 * @desc    Obtener países con soporte bancario
 * @access  Private
 * @query   {
 *   limit?: number - Límite de resultados (default: 50)
 * }
 */
router.get('/supported', countryController.getSupportedCountries);

/**
 * @route   GET /api/utilities/countries/search
 * @desc    Buscar países por nombre o código
 * @access  Private
 * @query   {
 *   q: string (required) - Término de búsqueda
 *   limit?: number - Límite de resultados (default: 20)
 * }
 */
router.get('/search', countryController.searchCountries);

/**
 * @route   GET /api/utilities/countries/stats
 * @desc    Obtener estadísticas de países
 * @access  Private
 */
router.get('/stats', countryController.getCountryStats);

/**
 * @route   GET /api/utilities/countries/continent/:continentCode
 * @desc    Obtener países por continente
 * @access  Private
 * @params  {
 *   continentCode: string (required) - Código del continente (AF, AS, EU, NA, OC, SA, AN)
 * }
 */
router.get('/continent/:continentCode', countryController.getCountriesByContinent);

/**
 * @route   GET /api/utilities/countries/:isoCode
 * @desc    Obtener país específico por código ISO
 * @access  Private
 * @params  {
 *   isoCode: string (required) - Código ISO del país (ej: "US", "MX")
 * }
 */
router.get('/:isoCode', countryController.getCountryByIsoCode);

module.exports = router;
