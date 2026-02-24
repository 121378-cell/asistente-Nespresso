import PDFDocument from 'pdfkit';
import { logger } from '../config/logger.js';

interface RepairData {
  id: string;
  name: string;
  machineModel?: string | null;
  serialNumber?: string | null;
  timestamp: Date;
  messages: Array<{
    role: string;
    text: string;
  }>;
}

export const generateRepairPdf = (repair: RepairData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).text('Informe de Reparación Nespresso', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`ID de Reparación: ${repair.id}`, { align: 'right' });
      doc.text(`Fecha: ${new Date(repair.timestamp).toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      // Machine Details
      doc.fontSize(14).text('Detalles de la Máquina', { underline: true });
      doc.fontSize(12).moveDown(0.5);
      doc.text(`Nombre: ${repair.name}`);
      doc.text(`Modelo: ${repair.machineModel || 'N/A'}`);
      doc.text(`N/S: ${repair.serialNumber || 'N/A'}`);
      doc.moveDown();

      // Chat History
      doc.fontSize(14).text('Historial de Diagnóstico', { underline: true });
      doc.moveDown(0.5);

      repair.messages.forEach((msg) => {
        const isUser = msg.role === 'USER';
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(isUser ? 'TÉCNICO:' : 'ASISTENTE:', { continued: true });
        doc.font('Helvetica').text(` ${msg.text}`);
        doc.moveDown(0.5);

        if (doc.y > 700) {
          doc.addPage();
        }
      });

      // Footer
      const pageCount = (doc as any)._pageBuffer.length;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .text(
            `Página ${i + 1} de ${pageCount} - Generado por Asistente Nespresso Pro`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (error) {
      logger.error({ err: error, repairId: repair.id }, 'Failed to generate PDF buffer');
      reject(error);
    }
  });
};
