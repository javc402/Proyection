const Bank = require('../../models/Bank');
const { Logger } = require('../../utils/logger');

// 🏦 CONTROLADOR DE BANCOS - UTILIDADES

/**
 * 📋 Obtener todos los bancos activos
 * GET /api/utilities/banks
 */
const getAllBanks = async (req, res) => {
  try {
    Logger.info('🏦 Obteniendo listado de bancos activos...');
    
    // 🔍 Extraer parámetros de consulta
    const { 
      country, 
      bankingType, 
      popular, 
      page = 1, 
      limit = 50,
      sort = 'displayOrder' 
    } = req.query;
    
    // 📦 Construir filtros
    const filters = { isActive: true };
    
    if (country) {
      filters.countryCode = country.toUpperCase();
    }
    
    if (bankingType) {
      filters.bankingType = bankingType;
    }
    
    if (popular !== undefined) {
      filters.isPopular = popular === 'true';
    }
    
    // 📊 Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const maxLimit = Math.min(parseInt(limit), 100); // Máximo 100 registros
    
    // 🔍 Obtener bancos con paginación
    const [banks, totalCount] = await Promise.all([
      Bank.find(filters)
        .select('name code icon logo countryCode website bankingType supportsInternational isPopular displayOrder')
        .sort(sort)
        .skip(skip)
        .limit(maxLimit)
        .lean(),
      Bank.countDocuments(filters)
    ]);
    
    // 📊 Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / maxLimit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    Logger.success(`✅ Se encontraron ${banks.length} bancos de ${totalCount} totales`);
    
    res.status(200).json({
      success: true,
      message: 'Bancos obtenidos exitosamente',
      data: {
        banks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          itemsPerPage: maxLimit,
          itemsInCurrentPage: banks.length
        },
        filters: {
          country,
          bankingType,
          popular,
          sort
        }
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener bancos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener bancos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔍 Obtener bancos por país
 * GET /api/utilities/banks/country/:countryCode
 */
const getBanksByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const countryCodeUpper = countryCode.toUpperCase();
    
    Logger.info(`🌍 Obteniendo bancos para el país: ${countryCodeUpper}`);
    
    // 🔍 Obtener bancos del país específico
    const banks = await Bank.find({ 
      countryCode: countryCodeUpper, 
      isActive: true 
    })
    .select('name code icon logo website bankingType supportsInternational isPopular')
    .sort({ displayOrder: 1, name: 1 })
    .lean();
    
    if (banks.length === 0) {
      Logger.warning(`⚠️ No se encontraron bancos para el país: ${countryCodeUpper}`);
      return res.status(404).json({
        success: false,
        message: `No se encontraron bancos activos para el país ${countryCodeUpper}`,
        data: {
          banks: [],
          countryCode: countryCodeUpper,
          count: 0
        }
      });
    }
    
    Logger.success(`✅ Se encontraron ${banks.length} bancos para ${countryCodeUpper}`);
    
    res.status(200).json({
      success: true,
      message: `Bancos de ${countryCodeUpper} obtenidos exitosamente`,
      data: {
        banks,
        countryCode: countryCodeUpper,
        count: banks.length
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener bancos por país:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener bancos por país',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * ⭐ Obtener bancos populares
 * GET /api/utilities/banks/popular
 */
const getPopularBanks = async (req, res) => {
  try {
    const { country, limit = 10 } = req.query;
    
    Logger.info('⭐ Obteniendo bancos populares...');
    
    // 📦 Construir filtros
    const filters = { 
      isActive: true, 
      isPopular: true 
    };
    
    if (country) {
      filters.countryCode = country.toUpperCase();
    }
    
    // 🔍 Obtener bancos populares
    const banks = await Bank.find(filters)
      .select('name code icon logo countryCode website bankingType')
      .sort({ displayOrder: 1, name: 1 })
      .limit(Math.min(parseInt(limit), 20)) // Máximo 20 bancos populares
      .lean();
    
    Logger.success(`✅ Se encontraron ${banks.length} bancos populares`);
    
    res.status(200).json({
      success: true,
      message: 'Bancos populares obtenidos exitosamente',
      data: {
        banks,
        count: banks.length,
        filters: { country }
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener bancos populares:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener bancos populares',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔍 Buscar bancos por nombre
 * GET /api/utilities/banks/search
 */
const searchBanks = async (req, res) => {
  try {
    const { q, country, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres',
        data: {
          banks: [],
          query: q,
          count: 0
        }
      });
    }
    
    Logger.info(`🔍 Buscando bancos con término: "${q}"`);
    
    // 📦 Construir filtros
    const filters = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ]
    };
    
    if (country) {
      filters.countryCode = country.toUpperCase();
    }
    
    // 🔍 Realizar búsqueda
    const banks = await Bank.find(filters)
      .select('name code icon logo countryCode website bankingType isPopular')
      .sort({ isPopular: -1, displayOrder: 1, name: 1 })
      .limit(Math.min(parseInt(limit), 50)) // Máximo 50 resultados
      .lean();
    
    Logger.success(`✅ Se encontraron ${banks.length} bancos con el término "${q}"`);
    
    res.status(200).json({
      success: true,
      message: `Búsqueda completada para "${q}"`,
      data: {
        banks,
        query: q,
        count: banks.length,
        filters: { country }
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al buscar bancos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar bancos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 📊 Obtener estadísticas de bancos
 * GET /api/utilities/banks/stats
 */
const getBankStats = async (req, res) => {
  try {
    Logger.info('📊 Calculando estadísticas de bancos...');
    
    // 📊 Obtener estadísticas agregadas
    const [
      totalBanks,
      activeBanks,
      banksByCountry,
      banksByType,
      popularBanks
    ] = await Promise.all([
      Bank.countDocuments(),
      Bank.countDocuments({ isActive: true }),
      Bank.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$countryCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Bank.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$bankingType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Bank.countDocuments({ isActive: true, isPopular: true })
    ]);
    
    const stats = {
      total: totalBanks,
      active: activeBanks,
      inactive: totalBanks - activeBanks,
      popular: popularBanks,
      byCountry: banksByCountry,
      byType: banksByType
    };
    
    Logger.success('✅ Estadísticas de bancos calculadas exitosamente');
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas de bancos obtenidas exitosamente',
      data: { stats }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener estadísticas de bancos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllBanks,
  getBanksByCountry,
  getPopularBanks,
  searchBanks,
  getBankStats
};
