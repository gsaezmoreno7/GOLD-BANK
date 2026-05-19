const express = require('express');
const router = express.Router();
const controller = require('../controllers/ordentrabajoController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/ordentrabajo:
 *   get:
 *     summary: Obtener todos los registros de OrdenTrabajo
 *     tags: [OrdenTrabajo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de OrdenTrabajo
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/ordentrabajo/{id}:
 *   get:
 *     summary: Obtener OrdenTrabajo por ID
 *     tags: [OrdenTrabajo]
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
 *         description: OrdenTrabajo encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/ordentrabajo:
 *   post:
 *     summary: Crear OrdenTrabajo
 *     tags: [OrdenTrabajo]
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
