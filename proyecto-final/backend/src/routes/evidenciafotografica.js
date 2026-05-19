const express = require('express');
const router = express.Router();
const controller = require('../controllers/evidenciafotograficaController');
const { verifyToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/evidenciafotografica/upload:
 *   post:
 *     summary: Subir foto de evidencia
 *     tags: [EvidenciaFotografica]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *               id_orden:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 */
router.post('/upload', verifyToken, upload.single('foto'), async (req, res) => {
  try {
    const { id_orden, descripcion } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const url_imagen = `http://localhost:3001/uploads/${req.file.filename}`;
    const data = await prisma.evidenciaFotografica.create({
      data: {
        id_orden: parseInt(id_orden),
        url_imagen,
        descripcion: descripcion || 'Evidencia'
      }
    });
    res.status(201).json(data);
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, controller.getAll);
router.get('/:id', verifyToken, controller.getById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;
