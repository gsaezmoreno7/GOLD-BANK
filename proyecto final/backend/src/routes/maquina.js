const express = require('express');
const router = express.Router();
const controller = require('../controllers/maquinaController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/maquina:
 *   get:
 *     summary: Obtener todos los registros de Maquina
 *     tags: [Maquina]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Maquina
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/maquina/{id}:
 *   get:
 *     summary: Obtener Maquina por ID
 *     tags: [Maquina]
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
 *         description: Maquina encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/maquina:
 *   post:
 *     summary: Crear Maquina
 *     tags: [Maquina]
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
