import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("el informe PDF conserva contexto completo del ejercicio", () => {
  assert.match(appSource, /buildExerciseContext/);
  assert.match(appSource, /Contexto: \$\{stripMarkup\(attempt\.context\)\}/);
  assert.match(appSource, /Respuesta: \$\{stripMarkup\(attempt\.answer\)\}/);
  assert.match(appSource, /Explicación: \$\{stripMarkup\(attempt\.explanation\)\}/);
});

test("el informe PDF pagina antes de invadir el pie de página", () => {
  assert.match(appSource, /ensurePdfSpace/);
  assert.match(appSource, /addPdfContinuationPage/);
  assert.match(appSource, /contentBottom = reportPage\.pageHeight - 24/);
});
