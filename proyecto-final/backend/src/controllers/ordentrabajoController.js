const prisma = require('../prismaClient');

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.ordenTrabajo.findMany({
      include: {
        evidencias: true,
        cliente: true,
        maquina: true,
        presupuestos: true
      }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.ordenTrabajo.findUnique({ 
      where: { id_orden: parseInt(req.params.id) },
      include: {
        evidencias: true,
        cliente: true,
        maquina: true,
        presupuestos: true
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
    const { tipo_maquina, id_cliente, ...rest } = req.body;
    const id_empresa = req.user.id_empresa;
    
    let id_maquina = req.body.id_maquina;
    
    // Si pasaron el texto de la máquina, la creamos automáticamente
    if (tipo_maquina) {
      const maquina = await prisma.maquina.create({
        data: {
          id_cliente: parseInt(id_cliente),
          tipo_maquina
        }
      });
      id_maquina = maquina.id_maquina;
    }
    
    const data = await prisma.ordenTrabajo.create({ 
      data: {
        ...rest,
        id_empresa,
        id_cliente: parseInt(id_cliente),
        id_maquina: id_maquina ? parseInt(id_maquina) : undefined
      } 
    });
    res.status(201).json(data);
  } catch (error) {
    console.error('Error in create work order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await prisma.ordenTrabajo.update({
      where: { id_orden: parseInt(req.params.id) },
      data: req.body
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.ordenTrabajo.delete({ where: { id_orden: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
