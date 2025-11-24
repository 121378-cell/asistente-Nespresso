import sys

# Leer el archivo
with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar la línea donde agregar el import de ThemeProvider
for i, line in enumerate(lines):
    if 'import { useAppContext }' in line:
        lines.insert(i + 1, "import { ThemeProvider } from './context/ThemeContext';\n")
        break

# Encontrar donde agregar ThemeToggle import
for i, line in enumerate(lines):
    if 'import LoadingSpinner' in line:
        lines.insert(i + 1, "import ThemeToggle from './components/ThemeToggle';\n")
        break

# Escribir el archivo modificado
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✓ Imports añadidos correctamente")
