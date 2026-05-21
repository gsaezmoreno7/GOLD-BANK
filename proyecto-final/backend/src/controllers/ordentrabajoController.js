const prisma = require('../prismaClient');

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.ordenTrabajo.findMany({
      include: {
        evidencias: true,
        cliente: true,
        maquina: true,
        presupuestos: true,
        materiales_usados: {
          include: {
            material: true
          }
        }
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
        presupuestos: true,
        materiales_usados: {
          include: {
            material: true
          }
        }
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
    const id = parseInt(req.params.id);
    
    // 1. Obtener presupuestos asociados para borrar sus dependencias
    const presupuestos = await prisma.presupuesto.findMany({
      where: { id_orden: id },
      select: { id_presupuesto: true }
    });
    
    const budgetIds = presupuestos.map(p => p.id_presupuesto);
    
    if (budgetIds.length > 0) {
      // Eliminar pagos asociados a estos presupuestos
      await prisma.pago.deleteMany({
        where: { id_presupuesto: { in: budgetIds } }
      });
      
      // Eliminar facturas asociadas a estos presupuestos
      await prisma.factura.deleteMany({
        where: { id_presupuesto: { in: budgetIds } }
      });
      
      // Eliminar presupuestos
      await prisma.presupuesto.deleteMany({
        where: { id_orden: id }
      });
    }
    
    // 2. Eliminar items de reparación
    await prisma.itemReparacion.deleteMany({
      where: { id_orden: id }
    });
    
    // 3. Eliminar evidencias fotográficas
    await prisma.evidenciaFotografica.deleteMany({
      where: { id_orden: id }
    });
    
    // 4. Eliminar materiales usados
    await prisma.materialUsado.deleteMany({
      where: { id_orden: id }
    });
    
    // 5. Finalmente, eliminar la orden de trabajo
    await prisma.ordenTrabajo.delete({
      where: { id_orden: id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar orden de trabajo:', error);
    res.status(500).json({ error: `No se pudo eliminar la orden de trabajo debido a un conflicto en la base de datos: ${error.message}` });
  }
};
