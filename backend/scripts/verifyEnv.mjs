import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ENV_PATH = path.resolve(process.cwd(), '.env');
const PLACEHOLDER_PATTERN = /(your_|example|changeme|replace-me|placeholder)/i;

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const entries = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex < 0) {
        return null;
      }
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      return [key, value];
    })
    .filter(Boolean);

  return Object.fromEntries(entries);
};

const fileEnv = parseEnvFile(ENV_PATH);
const env = { ...fileEnv, ...process.env };

const nodeEnv = env.NODE_ENV || 'development';
if (nodeEnv === 'test') {
  process.exit(0);
}

const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const optionalAnyGroup = [['SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY']];
const llmProvider = (env.LLM_PROVIDER || 'gemini').toLowerCase();

if (llmProvider === 'gemini') {
  requiredVars.push('GEMINI_API_KEY');
}

const missing = [];
const invalid = [];

for (const key of requiredVars) {
  const value = env[key];
  if (!value) {
    missing.push(key);
    continue;
  }
  if (PLACEHOLDER_PATTERN.test(value)) {
    invalid.push(key);
  }
}

for (const group of optionalAnyGroup) {
  const hasAny = group.some((key) => Boolean(env[key]));
  if (!hasAny) {
    missing.push(group.join(' or '));
  }
}

if (missing.length > 0 || invalid.length > 0) {
  console.error('Environment validation failed:');
  if (!fs.existsSync(ENV_PATH)) {
    console.error(`- Missing file: ${ENV_PATH}`);
  }
  if (missing.length > 0) {
    console.error(`- Missing vars: ${missing.join(', ')}`);
  }
  if (invalid.length > 0) {
    console.error(`- Placeholder values detected: ${invalid.join(', ')}`);
  }
  console.error('Fix backend/.env before starting the server.');
  process.exit(1);
}

process.exit(0);
