const prisma = require('../prismaClient');

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.cliente.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.cliente.findUnique({ where: { id_cliente: parseInt(req.params.id) } });
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const insertData = { ...req.body, id_empresa: req.user.id_empresa };
    const data = await prisma.cliente.create({ data: insertData });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await prisma.cliente.update({
      where: { id_cliente: parseInt(req.params.id) },
      data: req.body
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validar si existen órdenes de trabajo asociadas
    const ordersCount = await prisma.ordenTrabajo.count({ where: { id_cliente: id } });
    if (ordersCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene órdenes de trabajo asociadas en el taller. Primero elimine sus órdenes de trabajo.' 
      });
    }
    
    // Eliminar máquinas asociadas al cliente de forma segura (previniendo leaks FK)
    await prisma.maquina.deleteMany({ where: { id_cliente: id } });
    
    // Eliminar el cliente
    await prisma.cliente.delete({ where: { id_cliente: id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: `No se pudo eliminar el cliente debido a un conflicto en la base de datos: ${error.message}` });
  }
};
