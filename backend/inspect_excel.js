import XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('../data/inventory/ZN100.xlsm');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Sheet Name:', sheetName);
  console.log('--- FIRST 10 ROWS ---');
  data.slice(0, 10).forEach((row, i) => {
    console.log(`Row ${i}:`, JSON.stringify(row));
  });
} catch (error) {
  console.error('Error reading file:', error);
}
