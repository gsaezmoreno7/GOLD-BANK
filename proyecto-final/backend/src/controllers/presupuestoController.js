const prisma = require('../prismaClient');

const path = require('path');
const fs = require('fs');
const pdfGenerator = require('../utils/pdfGenerator');

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.presupuesto.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.presupuesto.findUnique({ where: { id_presupuesto: parseInt(req.params.id) } });
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const id_orden = req.body.id_orden;
    if (id_orden) {
      const orden = await prisma.ordenTrabajo.findUnique({
        where: { id_orden: parseInt(id_orden) },
        include: { cliente: true }
      });
      if (orden && orden.cliente && orden.cliente.rut === '76.123.456-K') {
        return res.status(400).json({ error: 'No se pueden generar presupuestos ni cobros comerciales para una Orden de Trabajo Interna del taller.' });
      }
    }
    const data = await prisma.presupuesto.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await prisma.presupuesto.update({
      where: { id_presupuesto: parseInt(req.params.id) },
      data: req.body
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.presupuesto.delete({ where: { id_presupuesto: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id_presupuesto: id },
      include: {
        orden: {
          include: {
            maquina: true,
            cliente: true,
            empresa: true
          }
        }
      }
    });

    if (!presupuesto) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    const { orden } = presupuesto;
    const { cliente, empresa } = orden;

    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const outputPath = path.join(uploadsDir, `presupuesto_${id}.pdf`);
    
    await pdfGenerator.generatePresupuestoPDF(presupuesto, orden, cliente, empresa, outputPath);

    res.download(outputPath, `presupuesto_${presupuesto.numero_presupuesto}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
};
