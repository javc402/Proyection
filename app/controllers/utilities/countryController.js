const Country = require('../../models/Country');
const { Logger } = require('../../utils/logger');

// 🌍 CONTROLADOR DE PAÍSES - UTILIDADES

/**
 * 📋 Obtener todos los países activos
 * GET /api/utilities/countries
 */
const getAllCountries = async (req, res) => {
  try {
    Logger.info('🌍 Obteniendo listado de países activos...');
    
    // 🔍 Extraer parámetros de consulta
    const { 
      continent, 
      supported, 
      page = 1, 
      limit = 50,
      sort = 'displayOrder' 
    } = req.query;
    
    // 📦 Construir filtros
    const filters = { isActive: true };
    
    if (continent) {
      filters.continent = continent.toUpperCase();
    }
    
    if (supported !== undefined) {
      filters.isSupported = supported === 'true';
    }
    
    // 📊 Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const maxLimit = Math.min(parseInt(limit), 100); // Máximo 100 registros
    
    // 🔍 Obtener países con paginación
    const [countries, totalCount] = await Promise.all([
      Country.find(filters)
        .select('name nativeName isoCode iso3Code flag flagEmoji continent region currency capital callingCode languages displayOrder isSupported')
        .sort(sort)
        .skip(skip)
        .limit(maxLimit)
        .lean(),
      Country.countDocuments(filters)
    ]);
    
    // 📊 Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / maxLimit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    Logger.success(`✅ Se encontraron ${countries.length} países de ${totalCount} totales`);
    
    res.status(200).json({
      success: true,
      message: 'Países obtenidos exitosamente',
      data: {
        countries,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          itemsPerPage: maxLimit,
          itemsInCurrentPage: countries.length
        },
        filters: {
          continent,
          supported,
          sort
        }
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener países:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener países',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🌟 Obtener países soportados (Colombia, USA, España)
 * GET /api/utilities/countries/supported
 */
const getSupportedCountries = async (req, res) => {
  try {
    Logger.info('🌟 Obteniendo países soportados...');
    
    // 🔍 Obtener solo países soportados
    const countries = await Country.find({ 
      isActive: true, 
      isSupported: true 
    })
    .select('name nativeName isoCode iso3Code flag flagEmoji continent region currency capital callingCode languages')
    .sort({ displayOrder: 1, name: 1 })
    .lean();
    
    Logger.success(`✅ Se encontraron ${countries.length} países soportados`);
    
    res.status(200).json({
      success: true,
      message: 'Países soportados obtenidos exitosamente',
      data: {
        countries,
        count: countries.length
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener países soportados:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener países soportados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🌎 Obtener países por continente
 * GET /api/utilities/countries/continent/:continentCode
 */
const getCountriesByContinent = async (req, res) => {
  try {
    const { continentCode } = req.params;
    const continentCodeUpper = continentCode.toUpperCase();
    
    // 🔍 Validar código de continente
    const validContinents = ['AF', 'AS', 'EU', 'NA', 'OC', 'SA', 'AN'];
    if (!validContinents.includes(continentCodeUpper)) {
      return res.status(400).json({
        success: false,
        message: `Código de continente inválido. Debe ser uno de: ${validContinents.join(', ')}`,
        data: {
          countries: [],
          continentCode: continentCodeUpper,
          count: 0
        }
      });
    }
    
    Logger.info(`🌎 Obteniendo países del continente: ${continentCodeUpper}`);
    
    // 🔍 Obtener países del continente específico
    const countries = await Country.find({ 
      continent: continentCodeUpper, 
      isActive: true 
    })
    .select('name nativeName isoCode iso3Code flag flagEmoji region currency capital callingCode isSupported')
    .sort({ displayOrder: 1, name: 1 })
    .lean();
    
    if (countries.length === 0) {
      Logger.warning(`⚠️ No se encontraron países para el continente: ${continentCodeUpper}`);
      return res.status(404).json({
        success: false,
        message: `No se encontraron países activos para el continente ${continentCodeUpper}`,
        data: {
          countries: [],
          continentCode: continentCodeUpper,
          count: 0
        }
      });
    }
    
    Logger.success(`✅ Se encontraron ${countries.length} países para ${continentCodeUpper}`);
    
    res.status(200).json({
      success: true,
      message: `Países de ${continentCodeUpper} obtenidos exitosamente`,
      data: {
        countries,
        continentCode: continentCodeUpper,
        count: countries.length
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener países por continente:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener países por continente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔍 Obtener país por código ISO
 * GET /api/utilities/countries/:isoCode
 */
const getCountryByIsoCode = async (req, res) => {
  try {
    const { isoCode } = req.params;
    const isoCodeUpper = isoCode.toUpperCase();
    
    Logger.info(`🔍 Obteniendo país con código ISO: ${isoCodeUpper}`);
    
    // 🔍 Buscar país por código ISO
    const country = await Country.findOne({ 
      isoCode: isoCodeUpper, 
      isActive: true 
    })
    .select('name nativeName isoCode iso3Code numericCode flag flagEmoji continent region subregion currency capital callingCode topLevelDomain timezones languages isSupported')
    .lean();
    
    if (!country) {
      Logger.warning(`⚠️ No se encontró país con código ISO: ${isoCodeUpper}`);
      return res.status(404).json({
        success: false,
        message: `No se encontró un país activo con el código ISO ${isoCodeUpper}`,
        data: null
      });
    }
    
    Logger.success(`✅ País encontrado: ${country.name} (${isoCodeUpper})`);
    
    res.status(200).json({
      success: true,
      message: `País ${country.name} obtenido exitosamente`,
      data: { country }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener país por código ISO:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener país',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔍 Buscar países por nombre
 * GET /api/utilities/countries/search
 */
const searchCountries = async (req, res) => {
  try {
    const { q, continent, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres',
        data: {
          countries: [],
          query: q,
          count: 0
        }
      });
    }
    
    Logger.info(`🔍 Buscando países con término: "${q}"`);
    
    // 📦 Construir filtros
    const filters = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { nativeName: { $regex: q, $options: 'i' } },
        { isoCode: { $regex: q, $options: 'i' } },
        { iso3Code: { $regex: q, $options: 'i' } }
      ]
    };
    
    if (continent) {
      filters.continent = continent.toUpperCase();
    }
    
    // 🔍 Realizar búsqueda
    const countries = await Country.find(filters)
      .select('name nativeName isoCode iso3Code flag flagEmoji continent region currency capital isSupported')
      .sort({ isSupported: -1, displayOrder: 1, name: 1 })
      .limit(Math.min(parseInt(limit), 50)) // Máximo 50 resultados
      .lean();
    
    Logger.success(`✅ Se encontraron ${countries.length} países con el término "${q}"`);
    
    res.status(200).json({
      success: true,
      message: `Búsqueda completada para "${q}"`,
      data: {
        countries,
        query: q,
        count: countries.length,
        filters: { continent }
      }
    });
    
  } catch (error) {
    Logger.error('❌ Error al buscar países:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar países',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 📊 Obtener estadísticas de países
 * GET /api/utilities/countries/stats
 */
const getCountryStats = async (req, res) => {
  try {
    Logger.info('📊 Calculando estadísticas de países...');
    
    // 📊 Obtener estadísticas agregadas
    const [
      totalCountries,
      activeCountries,
      supportedCountries,
      countriesByContinent,
      countriesWithCurrency
    ] = await Promise.all([
      Country.countDocuments(),
      Country.countDocuments({ isActive: true }),
      Country.countDocuments({ isActive: true, isSupported: true }),
      Country.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$continent', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Country.countDocuments({ 
        isActive: true, 
        'currency.code': { $exists: true, $ne: null } 
      })
    ]);
    
    const stats = {
      total: totalCountries,
      active: activeCountries,
      inactive: totalCountries - activeCountries,
      supported: supportedCountries,
      withCurrency: countriesWithCurrency,
      byContinent: countriesByContinent
    };
    
    Logger.success('✅ Estadísticas de países calculadas exitosamente');
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas de países obtenidas exitosamente',
      data: { stats }
    });
    
  } catch (error) {
    Logger.error('❌ Error al obtener estadísticas de países:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllCountries,
  getSupportedCountries,
  getCountriesByContinent,
  getCountryByIsoCode,
  searchCountries,
  getCountryStats
};
