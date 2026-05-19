const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialusadoController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/materialusado:
 *   get:
 *     summary: Obtener todos los registros de MaterialUsado
 *     tags: [MaterialUsado]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de MaterialUsado
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/materialusado/{id}:
 *   get:
 *     summary: Obtener MaterialUsado por ID
 *     tags: [MaterialUsado]
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
 *         description: MaterialUsado encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/materialusado:
 *   post:
 *     summary: Crear MaterialUsado
 *     tags: [MaterialUsado]
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
