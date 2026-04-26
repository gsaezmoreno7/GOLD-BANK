const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Realizar una transferencia a otro usuario
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/transfer', authenticate, transactionController.transfer);

/**
 * @swagger
 * /api/transactions/history:
 *   get:
 *     summary: Obtener historial de movimientos
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', authenticate, transactionController.getHistory);

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Realizar un abono a cuenta propia
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/deposit', authenticate, transactionController.deposit);

module.exports = router;
