const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagoController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/pago:
 *   get:
 *     summary: Obtener todos los registros de Pago
 *     tags: [Pago]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Pago
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/pago/{id}:
 *   get:
 *     summary: Obtener Pago por ID
 *     tags: [Pago]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/pago:
 *   post:
 *     summary: Crear Pago
 *     tags: [Pago]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Creado exitosamente
 */
router.post('/', verifyToken, controller.create);

router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;
