const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarioController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/usuario:
 *   get:
 *     summary: Obtener todos los registros de Usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Usuario
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/usuario/{id}:
 *   get:
 *     summary: Obtener Usuario por ID
 *     tags: [Usuario]
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
 *         description: Usuario encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/usuario:
 *   post:
 *     summary: Crear Usuario
 *     tags: [Usuario]
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
