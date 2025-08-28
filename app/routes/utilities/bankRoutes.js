const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const bankController = require('../../controllers/utilities/bankController');

// 🔐 Todas las rutas requieren autenticación
router.use(authMiddleware);

// 🏦 RUTAS DE BANCOS

/**
 * @route   GET /api/utilities/banks
 * @desc    Obtener todos los bancos disponibles
 * @access  Private
 * @query   {
 *   page?: number - Número de página (default: 1)
 *   limit?: number - Límite de resultados por página (default: 50)
 *   countryCode?: string - Filtrar por código de país
 * }
 */
router.get('/', bankController.getAllBanks);

/**
 * @route   GET /api/utilities/banks/popular
 * @desc    Obtener bancos populares
 * @access  Private
 * @query   {
 *   limit?: number - Límite de resultados (default: 10)
 *   countryCode?: string - Filtrar por país
 * }
 */
router.get('/popular', bankController.getPopularBanks);

/**
 * @route   GET /api/utilities/banks/search
 * @desc    Buscar bancos por nombre o código
 * @access  Private
 * @query   {
 *   q: string (required) - Término de búsqueda
 *   countryCode?: string - Filtrar por país
 *   limit?: number - Límite de resultados (default: 20)
 * }
 */
router.get('/search', bankController.searchBanks);

/**
 * @route   GET /api/utilities/banks/stats
 * @desc    Obtener estadísticas de bancos
 * @access  Private
 */
router.get('/stats', bankController.getBankStats);

/**
 * @route   GET /api/utilities/banks/country/:countryCode
 * @desc    Obtener bancos por código de país
 * @access  Private
 * @params  {
 *   countryCode: string (required) - Código ISO del país (ej: "US", "MX")
 * }
 */
router.get('/country/:countryCode', bankController.getBanksByCountry);

module.exports = router;
