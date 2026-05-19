const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/cliente:
 *   get:
 *     summary: Obtener todos los registros de Cliente
 *     tags: [Cliente]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Cliente
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/cliente/{id}:
 *   get:
 *     summary: Obtener Cliente por ID
 *     tags: [Cliente]
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
 *         description: Cliente encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/cliente:
 *   post:
 *     summary: Crear Cliente
 *     tags: [Cliente]
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
