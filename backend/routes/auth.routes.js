const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validator.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario Gold
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name, rut]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@goldbank.cl
 *               password:
 *                 type: string
 *                 example: "GoldPass2024!"
 *               full_name:
 *                 type: string
 *                 example: Juan Perez
 *               rut:
 *                 type: string
 *                 example: "12.345.678-9"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el portal Gold
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@goldbank.cl
 *               password:
 *                 type: string
 *                 example: "GoldPass2024!"
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;
