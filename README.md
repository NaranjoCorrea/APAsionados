# APAsionados

**APAsionados** es una app web gamificada para practicar citas y referencias **APA 7** con feedback formativo.

La aplicación está pensada para estudiantes que trabajan de forma individual: responden ejercicios, ven una solución explicada, se autocorrigen y progresan por niveles.

## Funcionalidades

- Juego por niveles con progresión desbloqueable.
- Preguntas de opción múltiple, ordenación y detección de errores.
- Reto final por nivel y Reto APAbullante.
- Banco amplio de ejercicios generado a partir de metadatos bibliográficos públicos.
- Importación de fuentes personalizadas mediante BibTeX.
- Chuleta APA 7 breve y práctica.
- Puntos, rachas, insignias, música, sonido y efectos visuales.
- Informe final en PDF con enunciado, contexto, respuesta, solución y explicación.
- Funcionamiento en navegador, sin cuentas y con almacenamiento local.

## Uso Local

Instalar dependencias:

```bash
npm install
```

Iniciar entorno de desarrollo:

```bash
npm run dev
```

Crear versión de producción:

```bash
npm run build
```

Ejecutar pruebas:

```bash
npm test
```

## Despliegue En Vercel

Configuración recomendada:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

## Estructura Publicable

El repositorio está preparado para no subir materiales internos. Consulta:

- [`docs/estructura-publicacion.md`](docs/estructura-publicacion.md)
- [`docs/ficha-didactica.md`](docs/ficha-didactica.md)
- [`docs/guia-docente.md`](docs/guia-docente.md)
- [`docs/metadatos-iso-19788-5.md`](docs/metadatos-iso-19788-5.md)
- [`docs/auditoria-accesibilidad-une-71362.md`](docs/auditoria-accesibilidad-une-71362.md)

## Privacidad

La versión actual no requiere cuentas. El progreso se guarda en el almacenamiento local del navegador. Los archivos BibTeX se procesan localmente.

## Créditos

APAsionados · © 2026 Francisco Luis Naranjo Correa.

## Licencia

Este repositorio se publica bajo licencia MIT. Consulta [`LICENSE.md`](LICENSE.md).
