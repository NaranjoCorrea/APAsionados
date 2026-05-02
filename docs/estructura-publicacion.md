# Estructura para publicación

La versión publicable de APAsionados no necesita subir las carpetas internas `Media/` ni `Normativa/`.

## Carpetas que sí deben subirse a GitHub

- `src/`: código de la aplicación.
- `src/assets/`: recursos optimizados necesarios en producción.
- `public/`: favicon, manifest y metadatos públicos.
- `docs/`: ficha didáctica, guía docente, metadatos y auditoría inicial.
- `test/`: pruebas automatizadas.
- `scripts/`: generadores auxiliares del catálogo de fuentes.
- `index.html`, `package.json` y `package-lock.json`.

## Carpetas internas excluidas

- `Media/`: originales, vídeos fuente, pruebas visuales y recursos internos.
- `Normativa/`: copias locales de normas y documentación de consulta.
- `dist/`: salida generada por `npm run build`.
- `node_modules/`: dependencias instaladas localmente.
- `tmp/`: descargas temporales usadas para generar catálogos.

Vercel reconstruirá `dist/` automáticamente a partir del repositorio usando `npm install` y `npm run build`.
