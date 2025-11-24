import re

# Leer el archivo
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Envolver el return con ThemeProvider
content = content.replace(
    '  return (\n    <div className="flex flex-col h-screen font-sans">',
    '  return (\n    <ThemeProvider>\n      <div className="flex flex-col h-screen font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-200">'
)

# 2. Cerrar ThemeProvider al final
content = content.replace(
    '    </div>\n  );\n};',
    '      </div>\n    </ThemeProvider>\n  );\n};'
)

# 3. Añadir dark mode al header
content = content.replace(
    '<header className="bg-white shadow-md p-4 z-10">',
    '<header className="bg-white dark:bg-gray-800 shadow-md p-4 z-10 transition-colors duration-200">'
)

# 4. Añadir dark mode a textos del header
content = content.replace(
    '<h1 className="text-xl font-bold text-gray-800">',
    '<h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">'
)

content = content.replace(
    '<p className="text-sm text-gray-500">',
    '<p className="text-sm text-gray-500 dark:text-gray-300">'
)

# 5. Añadir ThemeToggle button antes de los otros botones
content = content.replace(
    '          <div className="flex items-center gap-2">\n            <button\n              onClick={() => setShowDatabaseDashboard(true)}',
    '          <div className="flex items-center gap-2">\n            <ThemeToggle />\n            <button\n              onClick={() => setShowDatabaseDashboard(true)}'
)

# Escribir el archivo modificado
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ ThemeProvider y dark mode añadidos correctamente")
