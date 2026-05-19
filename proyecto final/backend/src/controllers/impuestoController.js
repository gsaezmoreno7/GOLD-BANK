const prisma = require('../prismaClient');

exports.getProyeccion = async (req, res) => {
  try {
    const id_empresa = req.user.id_empresa;
    
    // Obtener mes y año desde query params o usar el mes actual
    const mes = parseInt(req.query.mes || new Date().getMonth() + 1);
    const anio = parseInt(req.query.anio || new Date().getFullYear());

    // Crear rango de fechas para el mes completo
    const startDate = new Date(anio, mes - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(anio, mes, 0, 23, 59, 59, 999);

    // 1. Obtener todas las facturas de la empresa en el rango de fechas
    // Nota: Factura -> Presupuesto -> OrdenTrabajo -> Empresa
    const facturas = await prisma.factura.findMany({
      where: {
        presupuesto: {
          orden: {
            id_empresa: id_empresa
          }
        },
        fecha_emision: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        presupuesto: {
          include: {
            orden: {
              include: {
                cliente: true
              }
            }
          }
        }
      },
      orderBy: { fecha_emision: 'desc' }
    });

    // 2. Obtener todos los gastos de la empresa en el rango de fechas
    const gastos = await prisma.gasto.findMany({
      where: {
        id_empresa: id_empresa,
        fecha: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { fecha: 'desc' }
    });

    // 3. Cálculos Tributarios
    // IVA Ventas (Débito Fiscal) de facturas que no estén ANULADAS
    const facturasActivas = facturas.filter(f => f.estado !== 'ANULADA');
    const totalFacturadoVal = facturasActivas.reduce((sum, f) => sum + f.total_facturado, 0);
    
    // IVA es el 19% del valor neto. Si el total tiene el IVA incluido:
    // Total = Neto * 1.19 -> Neto = Total / 1.19 -> IVA = Total - Neto
    const ivaDebito = Math.round(totalFacturadoVal - (totalFacturadoVal / 1.19));
    const netoVentas = Math.round(totalFacturadoVal / 1.19);

    // IVA Compras (Crédito Fiscal) de gastos calificados (afecto_iva === true)
    const gastosCalificados = gastos.filter(g => g.afecto_iva === true);
    const totalGastadoVal = gastos.reduce((sum, g) => sum + g.monto, 0);
    const totalGastadoAfectoVal = gastosCalificados.reduce((sum, g) => sum + g.monto, 0);
    
    const ivaCredito = Math.round(totalGastadoAfectoVal - (totalGastadoAfectoVal / 1.19));
    const netoGastosAfectos = Math.round(totalGastadoAfectoVal / 1.19);
    const gastosExentos = totalGastadoVal - totalGastadoAfectoVal;

    // Resultado F29
    const diferenciaNeto = ivaDebito - ivaCredito;
    const tipoResultado = diferenciaNeto >= 0 ? 'PAGAR' : 'REMANENTE';

    // Mapear facturas para el detalle simplificado
    const detalleFacturas = facturas.map(f => {
      const total = f.total_facturado;
      const neto = Math.round(total / 1.19);
      const iva = Math.round(total - neto);
      return {
        id_factura: f.id_factura,
        numero_factura: f.numero_factura,
        fecha_emision: f.fecha_emision,
        cliente: f.presupuesto?.orden?.cliente?.nombre || 'Cliente General',
        total: total,
        neto: neto,
        iva: iva,
        estado: f.estado
      };
    });

    // Mapear gastos para el detalle simplificado
    const detalleGastos = gastos.map(g => {
      const total = g.monto;
      const afecto = g.afecto_iva === true;
      const neto = afecto ? Math.round(total / 1.19) : total;
      const iva = afecto ? Math.round(total - neto) : 0;
      return {
        id_gasto: g.id_gasto,
        descripcion: g.descripcion,
        fecha: g.fecha,
        categoria: g.categoria,
        tipo_documento: g.tipo_documento || 'FACTURA',
        afecto_iva: g.afecto_iva === true,
        total: total,
        neto: neto,
        iva: iva
      };
    });

    res.json({
      periodo: { mes, anio },
      resumen: {
        totalFacturado: totalFacturadoVal,
        netoVentas: netoVentas,
        ivaDebito: ivaDebito,
        totalGastado: totalGastadoVal,
        totalGastadoAfecto: totalGastadoAfectoVal,
        netoGastosAfectos: netoGastosAfectos,
        gastosExentos: gastosExentos,
        ivaCredito: ivaCredito,
        diferenciaNeto: Math.abs(diferenciaNeto),
        tipoResultado: tipoResultado
      },
      ventas: detalleFacturas,
      compras: detalleGastos
    });

  } catch (error) {
    console.error('Error en proyección de impuestos:', error);
    res.status(500).json({ error: 'Error al calcular la proyección de impuestos', detail: error.message });
  }
};
