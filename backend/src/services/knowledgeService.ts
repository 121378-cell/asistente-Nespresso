import { Prisma, PrismaClient } from '@prisma/client';
import { PDFParse } from 'pdf-parse';
import { KnowledgeSource } from './llm/types.js';

const prisma = new PrismaClient();

const MAX_CHUNK_CHARS = 1800;
const CHUNK_OVERLAP_CHARS = 250;
const MIN_TOKEN_LENGTH = 3;
const MAX_SEARCH_TOKENS = 10;

interface IngestPdfInput {
  title: string;
  pdfBase64: string;
}

interface IngestTextInput {
  title: string;
  text: string;
}

interface ParsedPdfResult {
  text: string;
  pageCount: number;
}

interface ChunkRecord {
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

interface RetrievedKnowledge {
  contextText: string;
  sources: KnowledgeSource[];
}

const normalizeText = (text: string): string =>
  text
    .replace(/\u0000/g, ' ')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const splitIntoChunks = (text: string): ChunkRecord[] => {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const chunks: ChunkRecord[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + MAX_CHUNK_CHARS);
    let cursor = end;

    if (end < normalized.length) {
      const nextParagraphBreak = normalized.lastIndexOf('\n\n', end);
      const nextLineBreak = normalized.lastIndexOf('\n', end);
      const nextSentenceBreak = Math.max(
        normalized.lastIndexOf('. ', end),
        normalized.lastIndexOf('? ', end),
        normalized.lastIndexOf('! ', end)
      );
      cursor = Math.max(nextParagraphBreak, nextLineBreak, nextSentenceBreak);
      if (cursor <= start + 300) cursor = end;
    }

    const content = normalized.slice(start, cursor).trim();
    if (content.length > 0) {
      const tokenCount = content.split(/\s+/).length;
      chunks.push({ chunkIndex, content, tokenCount });
      chunkIndex++;
    }

    if (cursor >= normalized.length) break;
    start = Math.max(cursor - CHUNK_OVERLAP_CHARS, start + 1);
  }

  return chunks;
};

const stripDataUrlPrefix = (value: string): string => {
  const marker = 'base64,';
  const markerIndex = value.indexOf(marker);
  if (markerIndex >= 0) return value.slice(markerIndex + marker.length);
  return value;
};

const decodePdfBase64 = (pdfBase64: string): Buffer => {
  const cleaned = stripDataUrlPrefix(pdfBase64).replace(/\s+/g, '');
  return Buffer.from(cleaned, 'base64');
};

const parsePdf = async (pdfBuffer: Buffer): Promise<ParsedPdfResult> => {
  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const parsed = await parser.getText();
    return {
      text: normalizeText(parsed.text || ''),
      pageCount: parsed.total || 0,
    };
  } finally {
    await parser.destroy();
  }
};

const toJsonValue = (value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =>
  value as Prisma.InputJsonValue;

export const ingestPdfKnowledge = async (input: IngestPdfInput) => {
  const pdfBuffer = decodePdfBase64(input.pdfBase64);
  const parsed = await parsePdf(pdfBuffer);
  if (!parsed.text) {
    throw new Error('No se pudo extraer texto del PDF');
  }

  const chunks = splitIntoChunks(parsed.text);
  if (chunks.length === 0) {
    throw new Error('No se generaron chunks de conocimiento');
  }

  const document = await prisma.knowledgeDocument.create({
    data: {
      title: input.title,
      sourceType: 'pdf',
      rawText: parsed.text,
      chunkCount: chunks.length,
      metadata: toJsonValue({ pageCount: parsed.pageCount }),
      chunks: {
        create: chunks.map((chunk) => ({
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
        })),
      },
    },
    include: {
      chunks: {
        select: { id: true },
      },
    },
  });

  return {
    id: document.id,
    title: document.title,
    sourceType: document.sourceType,
    chunkCount: document.chunkCount,
    pageCount: parsed.pageCount,
    createdAt: document.createdAt,
  };
};

export const ingestTextKnowledge = async (input: IngestTextInput) => {
  const normalized = normalizeText(input.text);
  if (!normalized) {
    throw new Error('Text is empty after normalization');
  }

  const chunks = splitIntoChunks(normalized);
  if (chunks.length === 0) {
    throw new Error('No se generaron chunks de conocimiento');
  }

  const document = await prisma.knowledgeDocument.create({
    data: {
      title: input.title,
      sourceType: 'text',
      rawText: normalized,
      chunkCount: chunks.length,
      chunks: {
        create: chunks.map((chunk) => ({
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
        })),
      },
    },
  });

  return {
    id: document.id,
    title: document.title,
    sourceType: document.sourceType,
    chunkCount: document.chunkCount,
    createdAt: document.createdAt,
  };
};

const tokenize = (text: string): string[] => {
  const rawTokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);

  return [...new Set(rawTokens)].slice(0, MAX_SEARCH_TOKENS);
};

const scoreChunk = (content: string, tokens: string[]): number => {
  const lower = content.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (lower.includes(token)) {
      score += 2;
    }
    const regex = new RegExp(`\\b${token}\\b`, 'g');
    const matches = lower.match(regex);
    if (matches) {
      score += Math.min(matches.length, 5);
    }
  }

  return score;
};

export const retrieveRelevantKnowledge = async (
  question: string,
  limit: number = 4
): Promise<RetrievedKnowledge> => {
  const tokens = tokenize(question);
  if (tokens.length === 0) {
    return { contextText: '', sources: [] };
  }

  const where = {
    OR: tokens.map((token) => ({
      content: {
        contains: token,
        mode: 'insensitive' as const,
      },
    })),
  };

  const candidates = await prisma.knowledgeChunk.findMany({
    where,
    include: {
      document: {
        select: { id: true, title: true },
      },
    },
    take: 120,
  });

  if (candidates.length === 0) {
    return { contextText: '', sources: [] };
  }

  const ranked = candidates
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk.content, tokens),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (ranked.length === 0) {
    return { contextText: '', sources: [] };
  }

  const contextLines = ranked.map((item) => {
    const content = item.chunk.content.slice(0, 900);
    return `[${item.chunk.document.title} | chunk ${item.chunk.chunkIndex}] ${content}`;
  });

  const sources: KnowledgeSource[] = ranked.map((item) => ({
    documentId: item.chunk.document.id,
    documentTitle: item.chunk.document.title,
    chunkId: item.chunk.id,
    chunkIndex: item.chunk.chunkIndex,
    score: item.score,
  }));

  return {
    contextText: contextLines.join('\n\n'),
    sources,
  };
};

export const listKnowledgeDocuments = async () =>
  prisma.knowledgeDocument.findMany({
    select: {
      id: true,
      title: true,
      sourceType: true,
      chunkCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

export const deleteKnowledgeDocument = async (id: string) =>
  prisma.knowledgeDocument.delete({
    where: { id },
    select: {
      id: true,
      title: true,
    },
  });
