const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemreparacionController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/itemreparacion:
 *   get:
 *     summary: Obtener todos los registros de ItemReparacion
 *     tags: [ItemReparacion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ItemReparacion
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/itemreparacion/{id}:
 *   get:
 *     summary: Obtener ItemReparacion por ID
 *     tags: [ItemReparacion]
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
 *         description: ItemReparacion encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/itemreparacion:
 *   post:
 *     summary: Crear ItemReparacion
 *     tags: [ItemReparacion]
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
