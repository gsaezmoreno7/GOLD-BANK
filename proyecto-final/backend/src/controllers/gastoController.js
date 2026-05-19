const prisma = require('../prismaClient');

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.gasto.findMany({
      where: { id_empresa: req.user.id_empresa },
      orderBy: { fecha: 'desc' }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.gasto.findFirst({
      where: { 
        id_gasto: parseInt(req.params.id),
        id_empresa: req.user.id_empresa 
      }
    });
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const insertData = { 
      descripcion: req.body.descripcion,
      monto: parseFloat(req.body.monto || 0),
      categoria: req.body.categoria || 'OTROS',
      fecha: req.body.fecha ? new Date(req.body.fecha) : new Date(),
      id_empresa: req.user.id_empresa,
      tipo_documento: req.body.tipo_documento !== undefined ? req.body.tipo_documento : 'FACTURA',
      afecto_iva: req.body.afecto_iva !== undefined ? Boolean(req.body.afecto_iva) : true
    };
    const data = await prisma.gasto.create({ data: insertData });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.descripcion !== undefined) updateData.descripcion = req.body.descripcion;
    if (req.body.monto !== undefined) updateData.monto = parseFloat(req.body.monto);
    if (req.body.categoria !== undefined) updateData.categoria = req.body.categoria;
    if (req.body.fecha !== undefined) updateData.fecha = new Date(req.body.fecha);
    if (req.body.tipo_documento !== undefined) updateData.tipo_documento = req.body.tipo_documento;
    if (req.body.afecto_iva !== undefined) updateData.afecto_iva = Boolean(req.body.afecto_iva);

    const data = await prisma.gasto.update({
      where: { id_gasto: parseInt(req.params.id) },
      data: updateData
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.gasto.delete({ where: { id_gasto: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
