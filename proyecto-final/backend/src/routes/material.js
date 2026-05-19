const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/material:
 *   get:
 *     summary: Obtener todos los registros de Material
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Material
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/material/{id}:
 *   get:
 *     summary: Obtener Material por ID
 *     tags: [Material]
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
 *         description: Material encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/material:
 *   post:
 *     summary: Crear Material
 *     tags: [Material]
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
