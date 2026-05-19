const express = require('express');
const router = express.Router();
const controller = require('../controllers/impuestoController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Impuesto
 *   description: Gestión de Impuestos y Proyección de IVA (F29)
 */

/**
 * @swagger
 * /api/impuesto/proyeccion:
 *   get:
 *     summary: Obtener proyección de IVA Débito y Crédito (F29) mensual
 *     tags: [Impuesto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *         description: Número de mes a proyectar (1-12)
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año a proyectar (ej. 2026)
 *     responses:
 *       200:
 *         description: Datos de la proyección tributaria y el libro de IVA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 periodo:
 *                   type: object
 *                   properties:
 *                     mes:
 *                       type: integer
 *                     anio:
 *                       type: integer
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalFacturado:
 *                       type: number
 *                     netoVentas:
 *                       type: number
 *                     ivaDebito:
 *                       type: number
 *                     totalGastado:
 *                       type: number
 *                     totalGastadoAfecto:
 *                       type: number
 *                     netoGastosAfectos:
 *                       type: number
 *                     gastosExentos:
 *                       type: number
 *                     ivaCredito:
 *                       type: number
 *                     diferenciaNeto:
 *                       type: number
 *                     tipoResultado:
 *                       type: string
 *                       enum: [PAGAR, REMANENTE]
 *                 ventas:
 *                   type: array
 *                   items:
 *                     type: object
 *                 compras:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/proyeccion', verifyToken, controller.getProyeccion);

module.exports = router;
