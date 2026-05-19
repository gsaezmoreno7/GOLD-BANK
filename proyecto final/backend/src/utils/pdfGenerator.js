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
      doc.fillColor(colorAzul).fontSize(20).text(empresa.nombre, { align: 'right' });
      doc.fontSize(10).fillColor('black').text(empresa.direccion, { align: 'right' });
      doc.text(`RUT: ${empresa.rut} | Tel: ${empresa.telefono}`, { align: 'right' });
      doc.moveDown();

      doc.fillColor(colorRojo).fontSize(16).text('PRESUPUESTO TÉCNICO', { align: 'center' });
      doc.fillColor('black').fontSize(12).text(`N° Presupuesto: ${presupuesto.numero_presupuesto}`, { align: 'center' });
      doc.text(`Fecha: ${new Date(presupuesto.fecha).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();

      // Datos Cliente
      doc.fontSize(12).fillColor(colorAzul).text('Datos del Cliente', { underline: true });
      doc.fillColor('black').fontSize(10);
      doc.text(`Nombre: ${cliente.nombre}`);
      doc.text(`RUT: ${cliente.rut}`);
      doc.text(`Teléfono: ${cliente.telefono || 'N/A'}`);
      doc.moveDown();

      // Datos Máquina
      doc.fontSize(12).fillColor(colorAzul).text('Datos de la Máquina', { underline: true });
      doc.fillColor('black').fontSize(10);
      doc.text(`Tipo: ${orden.maquina.tipo_maquina}`);
      doc.text(`Marca/Modelo: ${orden.maquina.marca || ''} ${orden.maquina.modelo || ''}`);
      doc.text(`Diagnóstico: ${orden.diagnostico || 'Pendiente'}`);
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
