const prisma = require('../prismaClient');

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.materialusado.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.materialusado.findUnique({ where: { id_materialusado: parseInt(req.params.id) } });
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { id_orden, id_material, cantidad, costo_real } = req.body;
    const matId = parseInt(id_material);
    const ordId = parseInt(id_orden);
    const qty = parseFloat(cantidad);
    
    let cost = parseFloat(costo_real);
    if (isNaN(cost) || cost === undefined || cost === null) {
      // Buscar el material para obtener el precio de referencia
      const material = await prisma.material.findUnique({ where: { id_material: matId } });
      cost = qty * (material ? material.precio_referencia : 0);
    }
    
    const data = await prisma.materialusado.create({
      data: {
        id_orden: ordId,
        id_material: matId,
        cantidad: qty,
        costo_real: cost
      }
    });
    res.status(201).json(data);
  } catch (error) {
    console.error('Error in create materialusado:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await prisma.materialusado.update({
      where: { id_materialusado: parseInt(req.params.id) },
      data: req.body
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.materialusado.delete({ where: { id_materialusado: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
