const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const {
  createBankAccount,
  getUserBankAccounts,
  getBankAccountById,
  updateBankAccount,
  activateBankAccount,
  deactivateBankAccount,
  deleteBankAccount,
  restoreBankAccount
} = require('../../controllers/management/bankAccountController');

// 🔐 Todas las rutas requieren autenticación
router.use(authMiddleware);

// 💳 RUTAS DE GESTIÓN DE CUENTAS BANCARIAS

/**
 * @route   POST /api/management/bank-accounts
 * @desc    Crear una nueva cuenta bancaria
 * @access  Private
 * @body    {
 *   countryId: string (required) - ID del país de la base de datos
 *   bankId: string (required) - ID del banco de la base de datos
 *   name: string (required) - Nombre descriptivo de la cuenta
 *   currentAmount: number (required) - Saldo actual (puede ser negativo, positivo o 0)
 *   description?: string - Descripción opcional de la cuenta
 *   currency?: string - Código de moneda ISO (default: "USD")
 *   accountNumber?: string - Número de cuenta (opcional)
 * }
 */
router.post('/', createBankAccount);

/**
 * @route   GET /api/management/bank-accounts
 * @desc    Obtener todas las cuentas bancarias del usuario autenticado
 * @access  Private
 * @query   {
 *   includeInactive?: boolean - Incluir cuentas inactivas (default: false)
 *   includeDeleted?: boolean - Incluir cuentas eliminadas (default: false)
 * }
 */
router.get('/', getUserBankAccounts);

/**
 * @route   GET /api/management/bank-accounts/:id
 * @desc    Obtener una cuenta bancaria específica por ID
 * @access  Private
 * @params  {
 *   id: string (required) - ID de la cuenta bancaria
 * }
 */
router.get('/:id', getBankAccountById);

/**
 * @route   PUT /api/management/bank-accounts/:id
 * @desc    Actualizar una cuenta bancaria
 * @access  Private
 * @params  {
 *   id: string (required) - ID de la cuenta bancaria
 * }
 * @body    {
 *   name?: string - Nuevo nombre de la cuenta
 *   currentAmount?: number - Nuevo saldo actual
 *   description?: string - Nueva descripción
 *   currency?: string - Nueva moneda
 *   accountNumber?: string - Nuevo número de cuenta
 * }
 */
router.put('/:id', updateBankAccount);

/**
 * @route   PATCH /api/management/bank-accounts/:id/activate
 * @desc    Activar una cuenta bancaria
 * @access  Private
 * @params  {
 *   id: string (required) - ID de la cuenta bancaria
 * }
 */
router.patch('/:id/activate', activateBankAccount);

/**
 * @route   PATCH /api/management/bank-accounts/:id/deactivate
 * @desc    Desactivar una cuenta bancaria
 * @access  Private
 * @params  {
 *   id: string (required) - ID de la cuenta bancaria
 * }
 */
router.patch('/:id/deactivate', deactivateBankAccount);

/**
 * @route   DELETE /api/management/bank-accounts/:id
 * @desc    Eliminar lógicamente una cuenta bancaria
 * @access  Private
 * @params  {
 *   id: string (required) - ID de la cuenta bancaria
 * }
 */
router.delete('/:id', deleteBankAccount);

/**
 * @route   PATCH /api/management/bank-accounts/:id/restore
 * @desc    Restaurar una cuenta bancaria eliminada
 * @access  Private
 * @params  {
 *   id: string (required) - ID de la cuenta bancaria eliminada
 * }
 */
router.patch('/:id/restore', restoreBankAccount);

module.exports = router;
