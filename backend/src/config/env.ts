import 'dotenv/config';
import { z } from 'zod';

const NODE_ENV_VALUES = ['development', 'test', 'production'] as const;
const LOG_LEVEL_VALUES = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const isPlaceholderSecret = (value: string): boolean =>
  /(your_|example|changeme|replace-me|placeholder)/i.test(value);

const envSchema = z.object({
  NODE_ENV: z.enum(NODE_ENV_VALUES).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(LOG_LEVEL_VALUES).optional(),
  TRUST_PROXY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

const allowedOrigins = (
  parsed.ALLOWED_ORIGINS
    ? parsed.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [parsed.FRONTEND_URL]
).filter(Boolean);

const supabaseServiceKey = parsed.SUPABASE_SERVICE_KEY || parsed.SUPABASE_SERVICE_ROLE_KEY || '';

if (parsed.SUPABASE_SERVICE_ROLE_KEY && !parsed.SUPABASE_SERVICE_KEY) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is deprecated. Prefer SUPABASE_SERVICE_KEY in environment variables.'
  );
}

if (parsed.NODE_ENV === 'production') {
  const missingVars: string[] = [];
  if (!parsed.DATABASE_URL || isPlaceholderSecret(parsed.DATABASE_URL))
    missingVars.push('DATABASE_URL');
  if (!parsed.GEMINI_API_KEY || isPlaceholderSecret(parsed.GEMINI_API_KEY))
    missingVars.push('GEMINI_API_KEY');
  if (!parsed.SUPABASE_URL) missingVars.push('SUPABASE_URL');
  if (!supabaseServiceKey || isPlaceholderSecret(supabaseServiceKey))
    missingVars.push('SUPABASE_SERVICE_KEY');
  if (allowedOrigins.length === 0) missingVars.push('ALLOWED_ORIGINS');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing or invalid required production environment variables: ${missingVars.join(', ')}`
    );
  }
}

export const env = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  frontendUrl: parsed.FRONTEND_URL,
  allowedOrigins,
  trustProxy: toBool(parsed.TRUST_PROXY, parsed.NODE_ENV === 'production'),
  logLevel: parsed.LOG_LEVEL,
  databaseUrl: parsed.DATABASE_URL || '',
  geminiApiKey: parsed.GEMINI_API_KEY || '',
  supabaseUrl: parsed.SUPABASE_URL || '',
  supabaseServiceKey,
};

export type AppEnv = typeof env;
