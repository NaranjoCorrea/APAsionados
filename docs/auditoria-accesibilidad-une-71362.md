# Auditoría inicial de accesibilidad y UNE 71362:2020

Esta auditoría es una revisión inicial de desarrollo, no una certificación formal.

## Mejoras ya incorporadas

- Controles independientes para sonido, música y efectos visuales.
- Tooltips y etiquetas accesibles en los controles principales.
- Regla CSS `prefers-reduced-motion` para reducir animaciones y ocultar confeti/efectos decorativos.
- Imágenes decorativas con `alt=""` y logotipo principal con texto alternativo.
- Feedback de solución con `aria-live`.
- Botón visible para salir de ronda o reto.
- Informe PDF con enunciado, contexto, respuesta, solución y explicación.

## Revisión por criterio de accesibilidad

- Teclado: pendiente de prueba completa de tabulación, foco, activación y orden lógico.
- Foco visible: parcialmente cubierto por estilos de navegador; conviene reforzarlo en botones, tarjetas y opciones.
- Contraste: pendiente de medición con herramienta WCAG, especialmente tarjetas grises sobre fondo oscuro.
- Texto alternativo: cubierto en imágenes principales/decorativas, pendiente de revisar iconos y vídeo celebratorio.
- Movimiento: mejora incorporada mediante `prefers-reduced-motion` y control de efectos.
- Audio: mejora incorporada con controles separados de sonido y música.
- Formularios: BibTeX usa input de archivo oculto dentro de etiqueta; conviene probar lectores de pantalla.
- PDF: el informe es visualmente útil, pero no se garantiza etiquetado accesible del PDF.

## Pendientes prioritarios

1. Ejecutar una prueba manual con teclado completo.
2. Medir contraste con una herramienta WCAG.
3. Añadir estilos de foco propios y consistentes.
4. Revisar con lector de pantalla los flujos: inicio, ronda, chuleta, informe.
5. Considerar una versión textual HTML del informe además del PDF.
6. Documentar decisiones de accesibilidad antes de publicación.
