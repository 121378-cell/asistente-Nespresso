import XLSX from 'xlsx';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const filePath = path.resolve(__dirname, '../../data/inventory/ZN100.xlsm');

async function main() {
  console.log('Reading Excel file:', filePath);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Headers are at row 7 (index 7)
    // Row 8 (index 8) is the first data row
    // Row 7 structure: [null, "Família", "Id de Producto", "Producto", "ABC Recambios", ...]

    const dataRows = data.slice(8);
    let count = 0;

    for (const row of dataRows) {
      if (!row || row.length < 4) continue;

      const family = String(row[1] || '').trim();
      const partNumber = String(row[2] || '').trim();
      const name = String(row[3] || '').trim();
      const category = String(row[4] || '').trim();

      if (!partNumber || !name) continue;

      await prisma.sparePart.upsert({
        where: { partNumber },
        update: {
          name,
          family,
          category,
        },
        create: {
          partNumber,
          name,
          family,
          category,
        },
      });
      count++;
    }

    console.log(`Successfully imported ${count} spare parts.`);
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
