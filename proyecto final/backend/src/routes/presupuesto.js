const express = require('express');
const router = express.Router();
const controller = require('../controllers/presupuestoController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/presupuesto:
 *   get:
 *     summary: Obtener todos los registros de Presupuesto
 *     tags: [Presupuesto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Presupuesto
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/presupuesto/{id}:
 *   get:
 *     summary: Obtener Presupuesto por ID
 *     tags: [Presupuesto]
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
 *         description: Presupuesto encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/presupuesto:
 *   post:
 *     summary: Crear Presupuesto
 *     tags: [Presupuesto]
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
