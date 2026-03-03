Coloca aqui tus archivos PDF para alimentar el conocimiento (RAG).

Ingesta por lote:
1. Copia tus `.pdf` en esta carpeta.
2. Ejecuta desde la raiz del proyecto:
   - `npm --prefix backend run knowledge:ingest-pdfs`

Opciones:
- Carpeta personalizada:
  - `npm --prefix backend run knowledge:ingest-pdfs -- --dir=C:\\ruta\\mis-pdfs`
- Permitir duplicados por titulo:
  - `npm --prefix backend run knowledge:ingest-pdfs -- --allow-duplicates`
