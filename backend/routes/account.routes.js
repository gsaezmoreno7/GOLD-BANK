const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/accounts/me:
 *   get:
 *     summary: Obtener información de mi cuenta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, accountController.getMe);

module.exports = router;
