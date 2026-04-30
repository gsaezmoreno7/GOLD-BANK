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

/**
 * @swagger
 * /api/transactions/external-transfer:
 *   post:
 *     summary: Recibir una transferencia desde un banco externo (Webhook del Profesor)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [destination, amount]
 *             properties:
 *               destination:
 *                 type: string
 *                 example: "12.345.678-9"
 *               amount:
 *                 type: number
 *                 example: 50000
 *               origin_bank:
 *                 type: string
 *                 example: "Banco Universidad"
 *               description:
 *                 type: string
 *                 example: "Prueba de Integración"
 *     responses:
 *       200:
 *         description: Transferencia recibida y procesada exitosamente
 */
router.post('/external-transfer', transactionController.externalDeposit);

module.exports = router;
