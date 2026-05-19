const fs = require('fs');
const path = require('path');

const models = [
  'Empresa', 'Usuario', 'Cliente', 'Maquina', 'OrdenTrabajo', 
  'EvidenciaFotografica', 'ItemReparacion', 'Material', 
  'MaterialUsado', 'Presupuesto', 'Pago', 'Factura'
];

models.forEach(model => {
  const modelLower = model.toLowerCase();
  const controllerName = modelLower + 'Controller';
  const routeName = modelLower;

  const controllerContent = "const prisma = require('../prismaClient');\n\n" +
"exports.getAll = async (req, res) => {\n" +
"  try {\n" +
"    const data = await prisma." + modelLower + ".findMany();\n" +
"    res.json(data);\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ error: error.message });\n" +
"  }\n" +
"};\n\n" +
"exports.getById = async (req, res) => {\n" +
"  try {\n" +
"    const data = await prisma." + modelLower + ".findUnique({ where: { id_" + modelLower + ": parseInt(req.params.id) } });\n" +
"    if (!data) return res.status(404).json({ error: 'No encontrado' });\n" +
"    res.json(data);\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ error: error.message });\n" +
"  }\n" +
"};\n\n" +
"exports.create = async (req, res) => {\n" +
"  try {\n" +
"    const data = await prisma." + modelLower + ".create({ data: req.body });\n" +
"    res.status(201).json(data);\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ error: error.message });\n" +
"  }\n" +
"};\n\n" +
"exports.update = async (req, res) => {\n" +
"  try {\n" +
"    const data = await prisma." + modelLower + ".update({\n" +
"      where: { id_" + modelLower + ": parseInt(req.params.id) },\n" +
"      data: req.body\n" +
"    });\n" +
"    res.json(data);\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ error: error.message });\n" +
"  }\n" +
"};\n\n" +
"exports.delete = async (req, res) => {\n" +
"  try {\n" +
"    await prisma." + modelLower + ".delete({ where: { id_" + modelLower + ": parseInt(req.params.id) } });\n" +
"    res.status(204).send();\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ error: error.message });\n" +
"  }\n" +
"};\n";

  const routeContent = "const express = require('express');\n" +
"const router = express.Router();\n" +
"const controller = require('../controllers/" + controllerName + "');\n" +
"const { verifyToken } = require('../middlewares/auth');\n\n" +
"/**\n" +
" * @swagger\n" +
" * /api/" + routeName + ":\n" +
" *   get:\n" +
" *     summary: Obtener todos los registros de " + model + "\n" +
" *     tags: [" + model + "]\n" +
" *     security:\n" +
" *       - bearerAuth: []\n" +
" *     responses:\n" +
" *       200:\n" +
" *         description: Lista de " + model + "\n" +
" */\n" +
"router.get('/', verifyToken, controller.getAll);\n\n" +
"/**\n" +
" * @swagger\n" +
" * /api/" + routeName + "/{id}:\n" +
" *   get:\n" +
" *     summary: Obtener " + model + " por ID\n" +
" *     tags: [" + model + "]\n" +
" *     security:\n" +
" *       - bearerAuth: []\n" +
" *     parameters:\n" +
" *       - in: path\n" +
" *         name: id\n" +
" *         required: true\n" +
" *         schema:\n" +
" *           type: integer\n" +
" *     responses:\n" +
" *       200:\n" +
" *         description: " + model + " encontrado\n" +
" */\n" +
"router.get('/:id', verifyToken, controller.getById);\n\n" +
"/**\n" +
" * @swagger\n" +
" * /api/" + routeName + ":\n" +
" *   post:\n" +
" *     summary: Crear " + model + "\n" +
" *     tags: [" + model + "]\n" +
" *     security:\n" +
" *       - bearerAuth: []\n" +
" *     requestBody:\n" +
" *       required: true\n" +
" *       content:\n" +
" *         application/json:\n" +
" *           schema:\n" +
" *             type: object\n" +
" *     responses:\n" +
" *       201:\n" +
" *         description: Creado exitosamente\n" +
" */\n" +
"router.post('/', verifyToken, controller.create);\n\n" +
"router.put('/:id', verifyToken, controller.update);\n" +
"router.delete('/:id', verifyToken, controller.delete);\n\n" +
"module.exports = router;\n";

  fs.writeFileSync(path.join(__dirname, 'src', 'controllers', controllerName + '.js'), controllerContent);
  fs.writeFileSync(path.join(__dirname, 'src', 'routes', routeName + '.js'), routeContent);
});

console.log('Archivos generados con éxito.');
