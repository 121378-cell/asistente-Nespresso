const fs = require('fs');
const path = require('path');

// Leer package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Añadir nuevos scripts
packageJson.scripts['deploy:auto'] = 'node scripts/auto-commit.js';
packageJson.scripts['deploy:check'] = 'npm test -- --run && npm run lint';

// Escribir package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✓ Scripts añadidos a package.json');
