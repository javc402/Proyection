const BankAccount = require('../../models/BankAccount');
const Bank = require('../../models/Bank');
const Country = require('../../models/Country');
const User = require('../../models/User');
const { Logger } = require('../../utils/logger');

// 💳 CONTROLADOR DE GESTIÓN DE CUENTAS BANCARIAS

/**
 * 📝 Crear una nueva cuenta bancaria
 * POST /api/management/bank-accounts
 */
const createBankAccount = async (req, res) => {
  try {
    const { countryId, bankId, name, currentAmount, description, currency, accountNumber } = req.body;
    const userId = req.user.id;

    // 🔍 Validar campos obligatorios
    if (!countryId || !bankId || !name || currentAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Los campos país, banco, nombre y monto actual son obligatorios',
        error: {
          type: 'VALIDATION_ERROR',
          details: {
            required: ['countryId', 'bankId', 'name', 'currentAmount'],
            received: { countryId, bankId, name, currentAmount }
          }
        }
      });
    }

    // 🌍 Verificar que el país existe
    const country = await Country.findById(countryId);
    if (!country) {
      return res.status(404).json({
        success: false,
        message: `El país con ID ${countryId} no existe`,
        error: {
          type: 'COUNTRY_NOT_FOUND',
          details: { countryId }
        }
      });
    }

    // 🏦 Verificar que el banco existe
    const bank = await Bank.findById(bankId);
    if (!bank) {
      return res.status(404).json({
        success: false,
        message: `El banco con ID ${bankId} no existe`,
        error: {
          type: 'BANK_NOT_FOUND',
          details: { bankId }
        }
      });
    }

    // 🔗 Verificar que el banco pertenece al país indicado
    if (!bank.countryId || bank.countryId.toString() !== countryId.toString()) {
      return res.status(400).json({
        success: false,
        message: `El banco ${bank.name} no pertenece al país ${country.name}`,
        error: {
          type: 'BANK_COUNTRY_MISMATCH',
          details: {
            bankCountryId: bank.countryId?.toString() || null,
            requestedCountryId: countryId,
            bankName: bank.name,
            countryName: country.name
          }
        }
      });
    }

    // 👤 Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: {
          type: 'USER_NOT_FOUND',
          details: { userId }
        }
      });
    }

    // 🔍 Verificar si ya existe una cuenta con el mismo banco para este usuario
    const existingAccount = await BankAccount.checkDuplicateAccount(userId, bankId);
    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: `Ya tienes una cuenta registrada con el banco ${bank.name}`,
        error: {
          type: 'DUPLICATE_BANK_ACCOUNT',
          details: {
            existingAccountId: existingAccount._id,
            bankName: bank.name,
            existingAccountName: existingAccount.name
          }
        }
      });
    }

    // 💰 Validar el monto
    const amount = parseFloat(currentAmount);
    if (isNaN(amount) || !isFinite(amount)) {
      return res.status(400).json({
        success: false,
        message: 'El monto actual debe ser un número válido',
        error: {
          type: 'INVALID_AMOUNT',
          details: { currentAmount }
        }
      });
    }

    // 🏗️ Crear la nueva cuenta bancaria
    const newBankAccount = new BankAccount({
      userId,
      countryId,
      bankId,
      name: name.trim(),
      description: description?.trim() || '',
      currentAmount: amount,
      currency: currency?.toUpperCase() || 'USD',
      accountNumber: accountNumber?.trim() || '',
      isActive: true,
      isDeleted: false
    });

    const savedAccount = await newBankAccount.save();

    // 📊 Poblar con información relacionada
    const populatedAccount = await BankAccount.findById(savedAccount._id)
      .populate('userId', 'firstName lastName email')
      .populate('countryId', 'name flag currency')
      .populate('bankId', 'name icon logo');

    Logger.info(`Nueva cuenta bancaria creada: ${savedAccount._id} para usuario ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Cuenta bancaria creada exitosamente',
      data: {
        account: populatedAccount,
        summary: {
          id: populatedAccount._id,
          name: populatedAccount.name,
          bank: bank.name,
          country: country.name,
          currentAmount: populatedAccount.currentAmount,
          currency: populatedAccount.currency,
          status: 'active'
        }
      }
    });

  } catch (error) {
    Logger.error('Error al crear cuenta bancaria:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación en los datos proporcionados',
        error: {
          type: 'VALIDATION_ERROR',
          details: error.errors
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * 📋 Obtener todas las cuentas bancarias del usuario
 * GET /api/management/bank-accounts
 */
const getUserBankAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { includeInactive, includeDeleted } = req.query;

    let query = { userId };

    // 🔍 Filtros opcionales
    if (includeDeleted === 'true') {
      query.includeDeleted = true;
    } else {
      query.isDeleted = false;
    }

    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const accounts = await BankAccount.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('countryId', 'name flag currency')
      .populate('bankId', 'name icon logo')
      .sort({ createdAt: -1 });

    // 📊 Estadísticas
    const stats = {
      total: accounts.length,
      active: accounts.filter(acc => acc.isActive && !acc.isDeleted).length,
      inactive: accounts.filter(acc => !acc.isActive && !acc.isDeleted).length,
      deleted: accounts.filter(acc => acc.isDeleted).length,
      totalBalance: accounts
        .filter(acc => acc.isActive && !acc.isDeleted)
        .reduce((sum, acc) => sum + acc.currentAmount, 0)
    };

    res.status(200).json({
      success: true,
      message: 'Cuentas bancarias obtenidas exitosamente',
      data: {
        accounts,
        statistics: stats
      }
    });

  } catch (error) {
    Logger.error('Error al obtener cuentas bancarias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las cuentas bancarias',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * 🔍 Obtener una cuenta bancaria específica
 * GET /api/management/bank-accounts/:id
 */
const getBankAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await BankAccount.findOne({
      _id: id,
      userId: userId,
      isDeleted: false
    })
      .populate('userId', 'firstName lastName email')
      .populate('countryId', 'name flag currency')
      .populate('bankId', 'name icon logo');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta bancaria no encontrada',
        error: {
          type: 'ACCOUNT_NOT_FOUND',
          details: { accountId: id }
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cuenta bancaria obtenida exitosamente',
      data: { account }
    });

  } catch (error) {
    Logger.error('Error al obtener cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * ✏️ Actualizar una cuenta bancaria
 * PUT /api/management/bank-accounts/:id
 */
const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, currentAmount, description, currency, accountNumber } = req.body;

    // 🔍 Buscar la cuenta
    const account = await BankAccount.findOne({
      _id: id,
      userId: userId,
      isDeleted: false
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta bancaria no encontrada',
        error: {
          type: 'ACCOUNT_NOT_FOUND',
          details: { accountId: id }
        }
      });
    }

    // 📝 Actualizar campos
    if (name !== undefined) account.name = name.trim();
    if (description !== undefined) account.description = description?.trim() || '';
    if (currency !== undefined) account.currency = currency.toUpperCase();
    if (accountNumber !== undefined) account.accountNumber = accountNumber?.trim() || '';
    
    if (currentAmount !== undefined) {
      const amount = parseFloat(currentAmount);
      if (isNaN(amount) || !isFinite(amount)) {
        return res.status(400).json({
          success: false,
          message: 'El monto actual debe ser un número válido',
          error: {
            type: 'INVALID_AMOUNT',
            details: { currentAmount }
          }
        });
      }
      account.currentAmount = amount;
    }

    const updatedAccount = await account.save();

    // 📊 Poblar con información relacionada
    const populatedAccount = await BankAccount.findById(updatedAccount._id)
      .populate('userId', 'firstName lastName email')
      .populate('countryId', 'name flag currency')
      .populate('bankId', 'name icon logo');

    Logger.info(`Cuenta bancaria actualizada: ${id} por usuario ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Cuenta bancaria actualizada exitosamente',
      data: { account: populatedAccount }
    });

  } catch (error) {
    Logger.error('Error al actualizar cuenta bancaria:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación en los datos proporcionados',
        error: {
          type: 'VALIDATION_ERROR',
          details: error.errors
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * ✅ Activar una cuenta bancaria
 * PATCH /api/management/bank-accounts/:id/activate
 */
const activateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await BankAccount.findOne({
      _id: id,
      userId: userId,
      isDeleted: false
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta bancaria no encontrada',
        error: {
          type: 'ACCOUNT_NOT_FOUND',
          details: { accountId: id }
        }
      });
    }

    if (account.isActive) {
      return res.status(400).json({
        success: false,
        message: 'La cuenta bancaria ya está activa',
        error: {
          type: 'ACCOUNT_ALREADY_ACTIVE',
          details: { accountId: id }
        }
      });
    }

    await account.activate();

    Logger.info(`Cuenta bancaria activada: ${id} por usuario ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Cuenta bancaria activada exitosamente',
      data: {
        accountId: id,
        status: 'active'
      }
    });

  } catch (error) {
    Logger.error('Error al activar cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al activar la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * ❌ Desactivar una cuenta bancaria
 * PATCH /api/management/bank-accounts/:id/deactivate
 */
const deactivateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await BankAccount.findOne({
      _id: id,
      userId: userId,
      isDeleted: false
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta bancaria no encontrada',
        error: {
          type: 'ACCOUNT_NOT_FOUND',
          details: { accountId: id }
        }
      });
    }

    if (!account.isActive) {
      return res.status(400).json({
        success: false,
        message: 'La cuenta bancaria ya está inactiva',
        error: {
          type: 'ACCOUNT_ALREADY_INACTIVE',
          details: { accountId: id }
        }
      });
    }

    await account.deactivate();

    Logger.info(`Cuenta bancaria desactivada: ${id} por usuario ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Cuenta bancaria desactivada exitosamente',
      data: {
        accountId: id,
        status: 'inactive'
      }
    });

  } catch (error) {
    Logger.error('Error al desactivar cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al desactivar la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * 🗑️ Eliminar lógicamente una cuenta bancaria
 * DELETE /api/management/bank-accounts/:id
 */
const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await BankAccount.findOne({
      _id: id,
      userId: userId,
      isDeleted: false
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta bancaria no encontrada',
        error: {
          type: 'ACCOUNT_NOT_FOUND',
          details: { accountId: id }
        }
      });
    }

    await account.softDelete();

    Logger.info(`Cuenta bancaria eliminada lógicamente: ${id} por usuario ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Cuenta bancaria eliminada exitosamente',
      data: {
        accountId: id,
        status: 'deleted',
        deletedAt: account.deletedAt
      }
    });

  } catch (error) {
    Logger.error('Error al eliminar cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * 🔄 Restaurar una cuenta bancaria eliminada
 * PATCH /api/management/bank-accounts/:id/restore
 */
const restoreBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await BankAccount.findOne({
      _id: id,
      userId: userId,
      isDeleted: true
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta bancaria eliminada no encontrada',
        error: {
          type: 'DELETED_ACCOUNT_NOT_FOUND',
          details: { accountId: id }
        }
      });
    }

    await account.restore();

    Logger.info(`Cuenta bancaria restaurada: ${id} por usuario ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Cuenta bancaria restaurada exitosamente',
      data: {
        accountId: id,
        status: account.isActive ? 'active' : 'inactive'
      }
    });

  } catch (error) {
    Logger.error('Error al restaurar cuenta bancaria:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al restaurar la cuenta bancaria',
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = {
  createBankAccount,
  getUserBankAccounts,
  getBankAccountById,
  updateBankAccount,
  activateBankAccount,
  deactivateBankAccount,
  deleteBankAccount,
  restoreBankAccount
};

