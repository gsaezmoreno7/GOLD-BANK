const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePresupuestoPDF = async (presupuesto, orden, cliente, empresa, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Colores corporativos (azul y rojo según requerimiento)
      const colorAzul = '#003366';
      const colorRojo = '#CC0000';

      const logoPath = path.join(__dirname, '../../uploads/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 100 });
        doc.moveDown(3);
      }

      // Header
      const nombreEmpresa = (orden && orden.empresa) ? orden.empresa.nombre : 'Maestranza R.S SPA';
      const direccionEmpresa = (orden && orden.empresa) ? (orden.empresa.direccion || 'Sector Industrial, Los Ángeles') : 'Sector Industrial, Los Ángeles';
      const rutEmpresa = (orden && orden.empresa) ? orden.empresa.rut : '76.123.456-K';
      const telefonoEmpresa = (orden && orden.empresa) ? (orden.empresa.telefono || '+56 9 1234 5678') : '+56 9 1234 5678';

      doc.fillColor(colorAzul).fontSize(20).text(nombreEmpresa, { align: 'right' });
      doc.fontSize(10).fillColor('black').text(direccionEmpresa, { align: 'right' });
      doc.text(`RUT: ${rutEmpresa} | Tel: ${telefonoEmpresa}`, { align: 'right' });
      doc.moveDown();

      doc.fillColor(colorRojo).fontSize(16).text('PRESUPUESTO TÉCNICO', { align: 'center' });
      doc.fillColor('black').fontSize(12).text(`N° Presupuesto: ${presupuesto.numero_presupuesto}`, { align: 'center' });
      doc.text(`Fecha: ${new Date(presupuesto.fecha).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Datos Cliente
      const nombreCliente = cliente ? cliente.nombre : 'Consumidor Final';
      const rutCliente = cliente ? cliente.rut : 'S/R';
      const telefonoCliente = cliente ? (cliente.telefono || 'N/A') : 'N/A';

      doc.fontSize(12).fillColor(colorAzul).text('Datos del Cliente', { underline: true });
      doc.fillColor('black').fontSize(10);
      doc.text(`Nombre: ${nombreCliente}`);
      doc.text(`RUT: ${rutCliente}`);
      doc.text(`Teléfono: ${telefonoCliente}`);
      doc.moveDown();

      // Datos Máquina
      const tipoMaquina = (orden && orden.maquina) ? orden.maquina.tipo_maquina : 'Equipo de Reparación';
      const marcaMaquina = (orden && orden.maquina) ? (orden.maquina.marca || '') : '';
      const modeloMaquina = (orden && orden.maquina) ? (orden.maquina.modelo || '') : '';
      const diagnosticoOrden = (orden && orden.diagnostico) ? orden.diagnostico : 'Diagnóstico inicial en proceso';

      doc.fontSize(12).fillColor(colorAzul).text('Datos de la Máquina', { underline: true });
      doc.fillColor('black').fontSize(10);
      doc.text(`Tipo: ${tipoMaquina}`);
      doc.text(`Marca/Modelo: ${marcaMaquina} ${modeloMaquina}`);
      doc.text(`Diagnóstico: ${diagnosticoOrden}`);
      doc.moveDown();

      // Tabla Económica Resumen
      doc.fontSize(12).fillColor(colorAzul).text('Resumen Económico', { underline: true });
      doc.fillColor('black').fontSize(10);
      
      // Total Final (Requisito crítico: "Total Presupuesto (IVA Incluido)")
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(14).text(`Total Presupuesto (IVA Incluido): $${presupuesto.total_final_iva_incluido.toLocaleString('es-CL')}`);
      doc.font('Helvetica').fontSize(12);
      doc.text(`Anticipo Requerido: $${presupuesto.anticipo_requerido.toLocaleString('es-CL')}`);
      doc.text(`Saldo Pendiente: $${presupuesto.saldo_pendiente.toLocaleString('es-CL')}`);
      
      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};
