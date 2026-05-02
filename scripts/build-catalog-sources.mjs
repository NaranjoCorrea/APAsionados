import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const inputDir = "tmp/crossref";
const outputFile = "src/data/catalogSources.js";

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function yearFrom(item) {
  const parts = item["published-print"]?.["date-parts"] || item["published-online"]?.["date-parts"];
  return parts?.[0]?.[0] ? String(parts[0][0]) : "";
}

function authorToBib(author) {
  const family = author.family?.trim();
  const given = author.given?.trim();
  if (!family) return "";
  return given ? `${family}, ${given}` : family;
}

function clean(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/[{}]/g, "")
    .trim();
}

function keyFor(item, index) {
  const doiPart = clean(item.DOI || "")
    .toLowerCase()
    .replace(/^10\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44);
  return `crossref-${doiPart || index}`;
}

const seen = new Set();
const entries = [];
const topics = {};

for (const file of readdirSync(inputDir).filter((name) => name.endsWith(".json")).sort()) {
  const topic = file.replace(/\.json$/, "");
  const data = JSON.parse(readFileSync(join(inputDir, file), "utf8"));
  const items = data.message?.items || [];
  topics[topic] = 0;

  for (const item of items) {
    const doi = clean(item.DOI || "");
    const title = clean(first(item.title));
    const journal = clean(first(item["container-title"]));
    const year = yearFrom(item);
    const authors = (item.author || []).map(authorToBib).filter(Boolean).slice(0, 12);

    if (!doi || !title || !journal || !year || authors.length === 0) continue;
    if (seen.has(doi.toLowerCase())) continue;
    seen.add(doi.toLowerCase());

    entries.push({
      key: keyFor(item, entries.length + 1),
      type: "article",
      topic,
      source: "Crossref REST API",
      fields: {
        author: authors.join(" and "),
        title,
        journal,
        year,
        volume: clean(item.volume || ""),
        number: clean(item.issue || ""),
        pages: clean(item.page || ""),
        doi
      }
    });
    topics[topic] += 1;
  }
}

const source = `// Catálogo generado desde metadatos públicos de Crossref.
// Regenerar con: node scripts/build-catalog-sources.mjs
// Temas y registros válidos: ${JSON.stringify(topics)}

export const catalogSources = ${JSON.stringify(entries, null, 2)};
`;

writeFileSync(outputFile, source);
console.log(`Wrote ${entries.length} sources to ${outputFile}`);
