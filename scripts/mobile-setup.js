import os from 'os';
import fs from 'fs';
import path from 'path';

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();
// Intentar detectar .env.local primero, luego .env
const envFiles = ['.env.local', '.env'];
const backendEnvPath = path.resolve('backend/.env');

console.log(`\x1b[32m[MOBILE SETUP] IP Detectada: ${localIp}\x1b[0m`);

// Actualizar Frontend
for (const f of envFiles) {
  const p = path.resolve(f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('VITE_API_URL')) {
      content = content.replace(/VITE_API_URL=.*/, `VITE_API_URL=http://${localIp}:3001`);
    } else {
      content += `\nVITE_API_URL=http://${localIp}:3001`;
    }
    fs.writeFileSync(p, content);
    console.log(`\x1b[34m[FRONTEND] ${f} actualizado a http://${localIp}:3001\x1b[0m`);
  }
}

// Actualizar Backend
if (fs.existsSync(backendEnvPath)) {
  let content = fs.readFileSync(backendEnvPath, 'utf8');
  
  // Actualizar FRONTEND_URL para el CORS
  if (content.includes('FRONTEND_URL')) {
    content = content.replace(/FRONTEND_URL=.*/, `FRONTEND_URL=http://${localIp}:3000`);
  } else {
    content += `\nFRONTEND_URL=http://${localIp}:3000`;
  }
  
  fs.writeFileSync(backendEnvPath, content);
  console.log(`\x1b[34m[BACKEND] backend/.env actualizado.\x1b[0m`);
}

console.log(`\n\x1b[35m[ACCESO] Local: http://localhost:3000\x1b[0m`);
console.log(`\x1b[35m[ACCESO MÓVIL] http://${localIp}:3000\x1b[0m\n`);
