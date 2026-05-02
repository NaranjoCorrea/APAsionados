import test from "node:test";
import assert from "node:assert/strict";
import { catalogSources } from "../src/data/catalogSources.js";
import { exercisesFromBibtex, exercisesFromEntries, formatApa, parseBibtex } from "../src/lib/bibtex.js";

const sampleBibtex = `@article{martinez2020water,
  author = {Mart\\'\\inez-Borreguero, G. and Maestre-Jim\\'enez, J. and Mateos-N\\'u\\~nez, M. and Naranjo-Correa, F. L.},
  title = {Water from the Perspective of Education for Sustainable Development: An Exploratory Study in the Spanish Secondary Education Curriculum},
  journal = {Water},
  volume = {12},
  number = {7},
  pages = {1877},
  year = {2020},
  doi = {10.3390/w12071877}
}`;

test("parseBibtex decodifica caracteres LaTeX comunes", () => {
  const [entry] = parseBibtex(sampleBibtex);

  assert.equal(entry.type, "article");
  assert.match(entry.fields.author, /Martínez-Borreguero/);
  assert.match(entry.fields.author, /Maestre-Jiménez/);
  assert.match(entry.fields.author, /Mateos-Núñez/);
});

test("formatApa genera una referencia de artículo con cursivas APA 7", () => {
  const [entry] = parseBibtex(sampleBibtex);
  const apa = formatApa(entry);

  assert.match(apa, /^Martínez-Borreguero, G\., Maestre-Jiménez, J\., Mateos-Núñez, M\., & Naranjo-Correa, F\. L\. \(2020\)\./);
  assert.match(apa, /\*Water\*, \*12\*\(7\), 1877\./);
  assert.match(apa, /https:\/\/doi\.org\/10\.3390\/w12071877/);
});

test("exercisesFromBibtex genera variedad y cita con et al. para tres o más autores", () => {
  const exercises = exercisesFromBibtex(sampleBibtex);
  const types = new Set(exercises.map((exercise) => exercise.type));
  const citationExercise = exercises.find((exercise) => exercise.id.includes("citation"));

  assert.ok(exercises.length >= 5);
  assert.ok(types.has("multiple-choice"));
  assert.ok(types.has("order"));
  assert.ok(types.has("spot-error"));
  assert.equal(citationExercise.answer, "(Martínez-Borreguero et al., 2020)");
});

test("el catálogo base genera más de 500 ejercicios variados", () => {
  const catalogExercises = exercisesFromEntries(catalogSources);
  const types = new Set(catalogExercises.map((exercise) => exercise.type));
  const levels = new Set(catalogExercises.map((exercise) => exercise.level));

  assert.ok(catalogSources.length >= 100);
  assert.ok(catalogExercises.length >= 500);
  assert.ok(types.has("multiple-choice"));
  assert.ok(types.has("order"));
  assert.ok(types.has("spot-error"));
  assert.ok(levels.has(1));
  assert.ok(levels.has(2));
  assert.ok(levels.has(3));
});
