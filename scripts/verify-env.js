#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Checks if all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = {
    frontend: [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_GEMINI_API_KEY',
    ],
    backend: [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'DATABASE_URL',
        'GEMINI_API_KEY',
        'PORT',
    ],
};

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const vars = {};

    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                vars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    return vars;
}

function checkEnvVars(envVars, requiredVars, context) {
    const missing = [];
    const placeholder = [];

    requiredVars.forEach(varName => {
        const value = envVars[varName];
        if (!value) {
            missing.push(varName);
        } else if (
            value.includes('your_') ||
            value.includes('your-project') ||
            value === 'development' ||
            value === 'production'
        ) {
            // Skip NODE_ENV and PORT
            if (varName !== 'NODE_ENV' && varName !== 'PORT') {
                placeholder.push(varName);
            }
        }
    });

    return { missing, placeholder };
}

function main() {
    console.log('🔍 Verificando variables de entorno...\n');

    let hasErrors = false;

    // Check Frontend
    console.log('📦 Frontend:');
    const frontendEnv = loadEnvFile(path.join(__dirname, '..', '.env'));

    if (!frontendEnv) {
        console.log('  ⚠️  Archivo .env no encontrado');
        console.log('  💡 Copia .env.example a .env y configura tus valores\n');
        hasErrors = true;
    } else {
        const { missing, placeholder } = checkEnvVars(frontendEnv, REQUIRED_VARS.frontend, 'frontend');

        if (missing.length > 0) {
            console.log('  ❌ Variables faltantes:');
            missing.forEach(v => console.log(`     - ${v}`));
            hasErrors = true;
        }

        if (placeholder.length > 0) {
            console.log('  ⚠️  Variables con valores de ejemplo:');
            placeholder.forEach(v => console.log(`     - ${v}`));
            hasErrors = true;
        }

        if (missing.length === 0 && placeholder.length === 0) {
            console.log('  ✅ Todas las variables configuradas correctamente');
        }
        console.log('');
    }

    // Check Backend
    console.log('🔧 Backend:');
    const backendEnv = loadEnvFile(path.join(__dirname, '..', 'backend', '.env'));

    if (!backendEnv) {
        console.log('  ⚠️  Archivo backend/.env no encontrado');
        console.log('  💡 Copia backend/.env.example a backend/.env y configura tus valores\n');
        hasErrors = true;
    } else {
        const { missing, placeholder } = checkEnvVars(backendEnv, REQUIRED_VARS.backend, 'backend');

        if (missing.length > 0) {
            console.log('  ❌ Variables faltantes:');
            missing.forEach(v => console.log(`     - ${v}`));
            hasErrors = true;
        }

        if (placeholder.length > 0) {
            console.log('  ⚠️  Variables con valores de ejemplo:');
            placeholder.forEach(v => console.log(`     - ${v}`));
            hasErrors = true;
        }

        if (missing.length === 0 && placeholder.length === 0) {
            console.log('  ✅ Todas las variables configuradas correctamente');
        }
        console.log('');
    }

    if (hasErrors) {
        console.log('❌ Por favor, configura las variables de entorno antes de continuar\n');
        process.exit(1);
    } else {
        console.log('✅ Todas las variables de entorno están configuradas correctamente\n');
        process.exit(0);
    }
}

main();
