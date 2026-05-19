const express = require('express');
const router = express.Router();
const controller = require('../controllers/facturaController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/factura:
 *   get:
 *     summary: Obtener todos los registros de Factura
 *     tags: [Factura]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Factura
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/factura/{id}:
 *   get:
 *     summary: Obtener Factura por ID
 *     tags: [Factura]
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
 *         description: Factura encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/factura:
 *   post:
 *     summary: Crear Factura
 *     tags: [Factura]
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
