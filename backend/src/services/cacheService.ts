import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../config/logger.js';

interface CacheEntry {
  response: any;
  expiresAt: number;
}

const CACHE_DIR = path.resolve(process.cwd(), 'backend', 'data', 'cache');
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1_000; // 24 hours

export const getCacheKey = (prompt: string, context?: any): string => {
  const data = JSON.stringify({ prompt, context });
  return crypto.createHash('sha256').update(data).digest('hex');
};

const ensureCacheDir = async () => {
  await fs.mkdir(CACHE_DIR, { recursive: true });
};

export const getCachedResponse = async (key: string): Promise<any | null> => {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const entry: CacheEntry = JSON.parse(content);

    if (Date.now() > entry.expiresAt) {
      await fs.unlink(filePath);
      return null;
    }

    return entry.response;
  } catch {
    return null;
  }
};

export const setCachedResponse = async (
  key: string,
  response: any,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> => {
  try {
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const entry: CacheEntry = {
      response,
      expiresAt: Date.now() + ttlMs,
    };
    await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8');
  } catch (error) {
    logger.error({ err: error, key }, 'Failed to set cache entry');
  }
};
