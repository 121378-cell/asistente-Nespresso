import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestPdfKnowledge, listKnowledgeDocuments } from '../src/services/knowledgeService.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(scriptDir, '..');
const defaultPdfDir = path.resolve(backendRoot, 'data', 'knowledge-pdfs');

const args = process.argv.slice(2);
const allowDuplicates = args.includes('--allow-duplicates');
const customDirArg = args.find((arg) => arg.startsWith('--dir='));
const inputDir = customDirArg ? path.resolve(customDirArg.replace('--dir=', '')) : defaultPdfDir;

const toTitleFromFilename = (filename: string): string =>
  path
    .basename(filename, path.extname(filename))
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const run = async () => {
  await fs.mkdir(inputDir, { recursive: true });

  const files = await fs.readdir(inputDir);
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log(`No PDF files found in: ${inputDir}`);
    return;
  }

  const existingDocs = await listKnowledgeDocuments();
  const existingTitles = new Set(existingDocs.map((doc) => doc.title.toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const file of pdfFiles) {
    const fullPath = path.resolve(inputDir, file);
    const title = toTitleFromFilename(file);

    if (!allowDuplicates && existingTitles.has(title.toLowerCase())) {
      console.log(`Skipped (already exists): ${file}`);
      skipped++;
      continue;
    }

    const buffer = await fs.readFile(fullPath);
    const pdfBase64 = buffer.toString('base64');

    const doc = await ingestPdfKnowledge({
      title,
      pdfBase64,
    });

    existingTitles.add(title.toLowerCase());
    created++;
    console.log(`Ingested: ${file} -> ${doc.id} (${doc.chunkCount} chunks)`);
  }

  console.log(`Done. created=${created}, skipped=${skipped}, dir=${inputDir}`);
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Knowledge PDF ingestion failed: ${message}`);
  process.exit(1);
});
