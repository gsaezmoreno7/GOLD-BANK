const express = require('express');
const router = express.Router();
const controller = require('../controllers/empresaController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/empresa:
 *   get:
 *     summary: Obtener todos los registros de Empresa
 *     tags: [Empresa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de Empresa
 */
router.get('/', verifyToken, controller.getAll);

/**
 * @swagger
 * /api/empresa/{id}:
 *   get:
 *     summary: Obtener Empresa por ID
 *     tags: [Empresa]
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
 *         description: Empresa encontrado
 */
router.get('/:id', verifyToken, controller.getById);

/**
 * @swagger
 * /api/empresa:
 *   post:
 *     summary: Crear Empresa
 *     tags: [Empresa]
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
