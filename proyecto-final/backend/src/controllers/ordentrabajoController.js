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
    const { tipo_maquina, id_cliente, es_interna, ...rest } = req.body;
    const id_empresa = req.user.id_empresa;
    
    let resolvedClientId = id_cliente ? parseInt(id_cliente) : null;
    let resolvedMachineId = req.body.id_maquina ? parseInt(req.body.id_maquina) : null;
    
    // Si la orden se define como interna, usamos o creamos el cliente y máquina del sistema
    if (es_interna) {
      let client = await prisma.cliente.findUnique({ where: { rut: '76.123.456-K' } });
      if (!client) {
        client = await prisma.cliente.create({
          data: {
            id_empresa,
            nombre: 'MAESTRANZA R.S SPA (INTERNO)',
            rut: '76.123.456-K',
            telefono: '+56912345678',
            direccion: 'Av. Industrial 1234, Los Ángeles',
            correo: 'contacto@maestranzars.cl',
            observaciones: 'Cliente de sistema para registrar órdenes de trabajo internas del taller (mantenimiento y control de activos).'
          }
        });
      }
      resolvedClientId = client.id_cliente;
      
      // Si no hay máquina seleccionada, buscamos o creamos una máquina interna por defecto
      if (!resolvedMachineId) {
        const maquinaName = tipo_maquina || 'Instalaciones / Equipos del Taller';
        let maquina = await prisma.maquina.findFirst({
          where: { id_cliente: client.id_cliente, tipo_maquina: maquinaName }
        });
        if (!maquina) {
          maquina = await prisma.maquina.create({
            data: {
              id_cliente: client.id_cliente,
              tipo_maquina: maquinaName,
              marca: 'Propia',
              modelo: 'Taller',
              observaciones: 'Activo o herramienta interna del taller.'
            }
          });
        }
        resolvedMachineId = maquina.id_maquina;
      }
    } else {
      // Flujo normal: Si pasaron el texto de la máquina y es orden de cliente, la creamos
      if (tipo_maquina && resolvedClientId && !resolvedMachineId) {
        const maquina = await prisma.maquina.create({
          data: {
            id_cliente: resolvedClientId,
            tipo_maquina
          }
        });
        resolvedMachineId = maquina.id_maquina;
      }
    }
    
    // Crear la orden de trabajo final
    const data = await prisma.ordenTrabajo.create({ 
      data: {
        ...rest,
        id_empresa,
        id_cliente: resolvedClientId,
        id_maquina: resolvedMachineId || undefined
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
