const express = require('express');
const router = express.Router();
const controller = require('../controllers/gastoController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/gasto:
 *   get:
 *     summary: Obtener todos los gastos de la empresa del usuario
 *     tags: [Gasto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Gastos
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/gasto/{id}:
 *   get:
 *     summary: Obtener Gasto por ID
 *     tags: [Gasto]
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
 *         description: Registro de Gasto encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/gasto:
 *   post:
 *     summary: Registrar un nuevo Gasto
 *     tags: [Gasto]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion
 *               - monto
 *               - categoria
 *             properties:
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               categoria:
 *                 type: string
 *                 enum: [INSUMOS, REPUESTOS, SERVICIOS, HERRAMIENTAS, OTROS, IMPUESTOS]
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               tipo_documento:
 *                 type: string
 *                 enum: [FACTURA, BOLETA, HONORARIOS, OTRO]
 *               afecto_iva:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
 */
router.post('/', verifyToken, controller.create);

/**
 * @swagger
 * /api/gasto/{id}:
 *   put:
 *     summary: Actualizar Gasto
 *     tags: [Gasto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Gasto actualizado
 */
router.put('/:id', verifyToken, controller.update);

/**
 * @swagger
 * /api/gasto/{id}:
 *   delete:
 *     summary: Eliminar Gasto
 *     tags: [Gasto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Gasto eliminado
 */
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;
