const TYPE_LABELS = {
  article: "artículo de revista",
  book: "libro",
  incollection: "capítulo de libro",
  inproceedings: "comunicación en congreso",
  proceedings: "actas",
  report: "informe",
  techreport: "informe técnico",
  misc: "fuente diversa",
  online: "fuente web"
};

export function parseBibtex(input) {
  const entries = [];
  const pattern = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)(?=\n\s*@\w+\s*\{|$)/g;
  let match;

  while ((match = pattern.exec(input)) !== null) {
    const [, rawType, key, body] = match;
    const fields = {};
    const fieldPattern = /(\w+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|"[^"]*"|[^,\n]+)\s*,?/g;
    let fieldMatch;

    while ((fieldMatch = fieldPattern.exec(body)) !== null) {
      const name = fieldMatch[1].toLowerCase();
      fields[name] = cleanValue(fieldMatch[2]);
    }

    entries.push({
      key: key.trim(),
      type: rawType.toLowerCase(),
      fields
    });
  }

  return entries;
}

export function exercisesFromBibtex(input) {
  return parseBibtex(input).flatMap((entry, index) => buildExercises(entry, index));
}

export function exercisesFromEntries(entries) {
  return entries.flatMap((entry, index) => buildExercises(entry, index));
}

function buildExercises(entry, index) {
  const apa = formatApa(entry);
  const authorText = formatAuthors(entry.fields.author || entry.fields.editor || "");
  const year = entry.fields.year || "s. f.";
  const title = sentenceCase(entry.fields.title || "Título sin datos");
  const typeLabel = TYPE_LABELS[entry.type] || "fuente";
  const authorField = entry.fields.author || entry.fields.editor || "";
  const firstSurname = firstAuthorSurname(authorField);
  const citation = citationFor(authorField, year, title);
  const doi = entry.fields.doi;
  const url = entry.fields.url;
  const generated = [];

  generated.push({
    id: `bib-${entry.key}-${index}-order`,
    level: 1,
    type: "order",
    prompt: `Ordena las piezas para construir una referencia APA 7 de ${typeLabel}.`,
    pieces: shuffle([authorText, `(${year}).`, `${titleForType(entry)}.`, endingFor(entry)]),
    answer: [authorText, `(${year}).`, `${titleForType(entry)}.`, endingFor(entry)],
    solution: apa,
    explanation:
      "La estructura base empieza por autoría, año, título y datos de la fuente. En APA 7, el uso de cursiva depende del tipo de fuente: libro o informe en el título; artículo no, pero revista y volumen sí.",
    generated: true
  });

  generated.push({
    id: `bib-${entry.key}-${index}-citation`,
    level: firstSurname ? 1 : 2,
    type: "multiple-choice",
    prompt: "Elige la cita parentética APA 7 correcta para esta fuente.",
    reference: apa,
    options: citationOptions(authorField, year, title),
    answer: citation,
    solution: citation,
    explanation:
      "La cita parentética conecta con el inicio de la referencia: normalmente apellido del primer autor y año.",
    generated: true
  });

  if (entry.type === "article") {
    generated.push(...articleFormatExercises(entry, index, apa, firstSurname, year, citation));
  }

  if (entry.type === "book") {
    generated.push(...bookFormatExercises(entry, index, apa, firstSurname, year));
  }

  if (doi || url) {
    generated.push({
      id: `bib-${entry.key}-${index}-access`,
      level: 2,
      type: "multiple-choice",
      prompt: "¿Qué dato de acceso debe conservarse al final de esta referencia?",
      reference: apa,
      options: [
        doi ? `https://doi.org/${stripDoi(doi)}` : url,
        "La ciudad de publicación.",
        "La fecha de consulta en todos los casos.",
        "El nombre del buscador usado para encontrarla."
      ],
      answer: doi ? `https://doi.org/${stripDoi(doi)}` : url,
      solution: doi ? `https://doi.org/${stripDoi(doi)}` : url,
      explanation:
        "En APA 7 se conserva el DOI como URL. Si no hay DOI y la fuente necesita localización web, se usa la URL.",
      generated: true
    });
  }

  if ((entry.fields.author || "").split(/\s+and\s+/i).length > 2) {
    generated.push({
      id: `bib-${entry.key}-${index}-multi-author`,
      level: 3,
      type: "multiple-choice",
      prompt: "¿Qué debes revisar con especial cuidado en esta fuente?",
      reference: apa,
      options: [
        "La puntuación y el uso de & entre el penúltimo y último autor en la referencia.",
        "Añadir siempre et al. en la lista de referencias.",
        "Eliminar todos los autores salvo el primero.",
        "Sustituir el año por la fecha de acceso."
      ],
      answer: "La puntuación y el uso de & entre el penúltimo y último autor en la referencia.",
      solution: apa,
      explanation:
        "En la lista de referencias se escriben los autores con comas y se usa & antes del último. 'Et al.' se usa en citas en texto, no como sustituto general en referencias.",
      generated: true
    });
  }

  return generated;
}

function articleFormatExercises(entry, index, apa, firstSurname, year, citation) {
  const fields = entry.fields;
  const title = sentenceCase(fields.title || "Título sin datos");
  const journal = fields.journal || fields.journaltitle || "Título de la Revista";
  const volume = fields.volume || "volumen";
  const number = fields.number || "número";
  const pages = fields.pages?.replace(/--/g, "-") || "páginas";
  const doi = fields.doi ? `https://doi.org/${stripDoi(fields.doi)}` : fields.url || "";
  const author = formatAuthors(fields.author || fields.editor || "");
  const source = `*${journal}*, *${volume}*${fields.number ? `(${number})` : ""}${fields.pages ? `, ${pages}` : ""}.${doi ? ` ${doi}` : ""}`;
  const correct = `${author} (${year}). ${title}. ${source}`;
  const items = [
    {
      id: `bib-${entry.key}-${index}-article-italics`,
      level: 2,
      type: "multiple-choice",
      prompt: "¿Qué versión aplica mejor las cursivas APA 7 en este artículo?",
      options: [
        correct,
        `${author} (${year}). *${title}*. ${journal}, ${volume}${fields.number ? `(${number})` : ""}${fields.pages ? `, ${pages}` : ""}.${doi ? ` ${doi}` : ""}`,
        `${author} (${year}). ${title}. *${journal}, ${volume}${fields.number ? `(${number})` : ""}${fields.pages ? `, ${pages}` : ""}*.${doi ? ` ${doi}` : ""}`,
        `${author} (${year}). ${title}. ${journal}, *${volume}${fields.number ? `(${number})` : ""}${fields.pages ? `, ${pages}` : ""}*.${doi ? ` ${doi}` : ""}`
      ],
      answer: correct,
      solution: correct,
      explanation:
        "En artículos, el título del artículo no va en cursiva. Sí van en cursiva el título de la revista y el volumen; el número, las páginas y el DOI no.",
      generated: true
    },
    {
      id: `bib-${entry.key}-${index}-article-source-order`,
      level: 2,
      type: "order",
      prompt: "Ordena los datos de la fuente del artículo.",
      pieces: [
        `*${journal}*,`,
        `*${volume}*${fields.number ? `(${number}),` : ","}`,
        fields.pages ? `${pages}.` : doi ? `${doi}` : "sin páginas.",
        fields.pages && doi ? doi : ""
      ].filter(Boolean),
      answer: [
        `*${journal}*,`,
        `*${volume}*${fields.number ? `(${number}),` : ","}`,
        fields.pages ? `${pages}.` : doi ? `${doi}` : "sin páginas.",
        fields.pages && doi ? doi : ""
      ].filter(Boolean),
      solution: source,
      explanation:
        "La parte final de un artículo sigue el patrón revista, volumen(número), páginas y DOI/URL cuando existe.",
      generated: true
    }
  ];

  if (fields.pages) {
    items.push({
      id: `bib-${entry.key}-${index}-article-no-pp`,
      level: 2,
      type: "spot-error",
      prompt: "Marca el fragmento que sobra en una referencia de artículo de revista.",
      fragments: [
        `${author} (${year}).`,
        `${title}.`,
        `*${journal}*, *${volume}*${fields.number ? `(${number})` : ""},`,
        `pp. ${pages}.`,
        doi
      ].filter(Boolean),
      answer: `pp. ${pages}.`,
      solution: correct,
      explanation:
        "En artículos de revista no se escribe 'pp.' antes del intervalo o número de páginas. La revista y el volumen sí conservan la cursiva.",
      generated: true
    });
  }

  if (firstSurname) {
    items.push({
      id: `bib-${entry.key}-${index}-article-coherence`,
      level: 3,
      type: "multiple-choice",
      prompt: "Elige la pareja cita-referencia más coherente.",
      options: [
        `${citation} | ${correct}`,
        `(*${journal}*, ${year}) | ${correct}`,
        `(${firstSurname}, pp. ${pages}) | ${correct}`,
        `(${title.slice(0, 28)}, ${year}) | ${correct}`
      ],
      answer: `${citation} | ${correct}`,
      solution: `${citation} | ${correct}`,
      explanation:
        "La cita en texto debe conectar con el inicio de la referencia. En obras con tres o más autores, APA 7 usa el primer apellido seguido de et al. y el año.",
      generated: true
    });
  }

  return items;
}

function bookFormatExercises(entry, index, apa, firstSurname, year) {
  const fields = entry.fields;
  const title = sentenceCase(fields.title || "Título sin datos");
  const author = formatAuthors(fields.author || fields.editor || "");
  const authorField = fields.author || fields.editor || "";
  const citation = citationFor(authorField, year, title);
  const publisher = fields.publisher || "Editorial sin datos";
  return [
    {
      id: `bib-${entry.key}-${index}-book-italics`,
      level: 1,
      type: "multiple-choice",
      prompt: "¿Qué elemento debe ir en cursiva en esta referencia de libro?",
      reference: `${author} (${year}). ${title}. ${publisher}.`,
      options: ["El título del libro.", "El apellido del autor.", "La editorial.", "El año de publicación."],
      answer: "El título del libro.",
      solution: apa,
      explanation:
        "En libros, el título de la obra va en cursiva. La editorial no va en cursiva.",
      generated: true
    },
    {
      id: `bib-${entry.key}-${index}-book-citation-match`,
      level: 3,
      type: "multiple-choice",
      prompt: "Elige la cita parentética que corresponde a esta referencia.",
      reference: apa,
      options: [
        citation,
        `(*${title}*, ${year})`,
        `(${publisher}, ${year})`,
        firstSurname ? `(${firstSurname}, ${publisher})` : `(Autoría, ${publisher})`
      ],
      answer: citation,
      solution: citation,
      explanation:
        "La cita toma el primer elemento de la referencia y el año; no la editorial ni el título si hay autoría.",
      generated: true
    }
  ];
}

export function formatApa(entry) {
  const fields = entry.fields;
  const author = formatAuthors(fields.author || fields.editor || "");
  const year = fields.year || "s. f.";
  const title = titleForType(entry);
  return `${author} (${year}). ${title}. ${endingFor(entry)}`.replace(/\s+/g, " ").trim();
}

function endingFor(entry) {
  const fields = entry.fields;
  const type = entry.type;
  const doiOrUrl = fields.doi ? ` https://doi.org/${stripDoi(fields.doi)}` : fields.url ? ` ${fields.url}` : "";

  if (type === "article") {
    const journal = fields.journal || fields.journaltitle || "Título de la Revista";
    const volume = fields.volume ? `, *${fields.volume}*` : "";
    const number = fields.number ? `(${fields.number})` : "";
    const pages = fields.pages ? `, ${fields.pages.replace(/--/g, "-")}` : "";
    return `*${journal}*${volume}${number}${pages}.${doiOrUrl}`.trim();
  }

  if (type === "book") {
    return `${fields.publisher || "Editorial sin datos"}.${doiOrUrl}`.trim();
  }

  if (type === "incollection" || type === "inbook") {
    const booktitle = fields.booktitle || "Obra colectiva sin datos";
    const pages = fields.pages ? ` (pp. ${fields.pages.replace(/--/g, "-")})` : "";
    return `En *${booktitle}*${pages}. ${fields.publisher || "Editorial sin datos"}.${doiOrUrl}`.trim();
  }

  if (type === "inproceedings" || type === "proceedings") {
    const booktitle = fields.booktitle || fields.series || "Actas sin datos";
    const pages = fields.pages ? ` (pp. ${fields.pages.replace(/--/g, "-")})` : "";
    const publisher = fields.publisher ? ` ${fields.publisher}.` : "";
    return `En *${booktitle}*${pages}.${publisher}${doiOrUrl}`.replace(/\s+/g, " ").trim();
  }

  return `${fields.howpublished || fields.publisher || fields.organization || "Fuente sin datos"}.${doiOrUrl}`.trim();
}

function titleForType(entry) {
  const title = sentenceCase(entry.fields.title || "Título sin datos");
  if (entry.type === "article" || entry.type === "incollection" || entry.type === "inbook" || entry.type === "inproceedings") {
    return title;
  }
  return `*${title}*`;
}

function formatAuthors(authorField) {
  if (!authorField) return "Autoría sin datos.";
  const decoded = decodeLatex(authorField).replace(/[{}]/g, "").trim();
  if (decoded.includes(" & ") && !/\s+and\s+/i.test(decoded)) {
    return decoded;
  }
  const authors = decoded.split(/\s+and\s+/i).map(formatSingleAuthor).filter(Boolean);
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]}, & ${authors[1]}`;
  return `${authors.slice(0, -1).join(", ")}, & ${authors[authors.length - 1]}`;
}

function formatSingleAuthor(author) {
  const clean = decodeLatex(author).replace(/[{}]/g, "").trim();
  if (!clean) return "";
  if (clean.includes(",")) {
    const [surname, names] = clean.split(",").map((part) => part.trim());
    return `${surname}, ${initials(names)}`;
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const surname = parts.pop();
  return `${surname}, ${initials(parts.join(" "))}`;
}

function initials(names = "") {
  return names
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => `${name[0].toUpperCase()}.`)
    .join(" ");
}

function firstAuthorSurname(authorField) {
  const first = decodeLatex(authorField).split(/\s+and\s+/i)[0]?.replace(/[{}]/g, "").trim();
  if (!first) return "";
  if (first.includes(",")) return first.split(",")[0].trim();
  const parts = first.split(/\s+/);
  return parts[parts.length - 1];
}

function authorCount(authorField) {
  const decoded = decodeLatex(authorField).replace(/[{}]/g, "").trim();
  if (!decoded) return 0;
  if (/\s+and\s+/i.test(decoded)) return decoded.split(/\s+and\s+/i).filter(Boolean).length;
  if (decoded.includes(" & ")) return decoded.split(/\s*&\s*/).filter(Boolean).length;
  return 1;
}

function secondAuthorSurname(authorField) {
  const decoded = decodeLatex(authorField).replace(/[{}]/g, "").trim();
  const parts = /\s+and\s+/i.test(decoded)
    ? decoded.split(/\s+and\s+/i)
    : decoded.includes(" & ")
      ? decoded.split(/\s*&\s*/)
      : [];
  if (parts.length < 2) return "";
  return firstAuthorSurname(parts[1]);
}

function sentenceCase(value) {
  const clean = cleanValue(value).replace(/[{}]/g, "");
  if (!clean) return clean;
  const letters = clean.match(/\p{L}/gu) || [];
  const uppercaseLetters = clean.match(/\p{Lu}/gu) || [];
  const mostlyUppercase = letters.length > 10 && uppercaseLetters.length / letters.length > 0.72;
  if (!mostlyUppercase) return clean.charAt(0).toUpperCase() + clean.slice(1);

  let converted = clean.toLocaleLowerCase("es-ES");
  converted = converted.charAt(0).toLocaleUpperCase("es-ES") + converted.slice(1);
  converted = converted.replace(/(:\s+)(\p{L})/gu, (_match, prefix, letter) => prefix + letter.toLocaleUpperCase("es-ES"));
  const acronyms = ["STEM", "ICT", "SDG", "SDGs", "LED", "LEDs", "IATED", "INTED", "ICERI", "EDULEARN", "CMAPTOOLS"];
  for (const acronym of acronyms) {
    converted = converted.replace(new RegExp(`\\b${acronym.toLocaleLowerCase("es-ES")}\\b`, "giu"), acronym);
  }
  return converted;
}

function citationFor(authorField, year, fallbackTitle = "Título") {
  const surname = firstAuthorSurname(authorField);
  const count = authorCount(authorField);
  if (!surname) return `(${fallbackTitle.slice(0, 32)}, ${year})`;
  if (count === 2) return `(${surname} & ${secondAuthorSurname(authorField)}, ${year})`;
  if (count >= 3) return `(${surname} et al., ${year})`;
  return `(${surname}, ${year})`;
}

function citationOptions(authorField, year, fallbackTitle = "Título") {
  const surname = firstAuthorSurname(authorField);
  const correct = citationFor(authorField, year, fallbackTitle);
  if (!surname) return [`(${fallbackTitle.slice(0, 32)}, ${year})`, `(Autor, ${year})`, `(${year})`, `(s. a., ${year})`];
  return [
    correct,
    `(${surname}, ${year})`,
    `(${surname} ${year})`,
    `(${surname}, ${year}, p. 1)`
  ].filter((option, index, array) => array.indexOf(option) === index);
}

function stripDoi(doi) {
  return doi.replace(/^https?:\/\/doi\.org\//i, "").replace(/^doi:/i, "").trim();
}

function cleanValue(value = "") {
  return decodeLatex(value.trim().replace(/^["{]+|["}]+$/g, "")).replace(/\s+/g, " ");
}

function decodeLatex(value = "") {
  const simpleCommands = {
    "\\i": "i",
    "\\j": "j",
    "\\aa": "å",
    "\\AA": "Å",
    "\\ae": "æ",
    "\\AE": "Æ",
    "\\oe": "œ",
    "\\OE": "Œ",
    "\\o": "ø",
    "\\O": "Ø",
    "\\ss": "ß",
    "\\l": "ł",
    "\\L": "Ł",
    "\\&": "&",
    "\\%": "%",
    "\\$": "$",
    "\\_": "_"
  };

  const accentMap = {
    "'": {
      a: "á", e: "é", i: "í", o: "ó", u: "ú", y: "ý",
      A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", Y: "Ý"
    },
    "`": {
      a: "à", e: "è", i: "ì", o: "ò", u: "ù",
      A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù"
    },
    "^": {
      a: "â", e: "ê", i: "î", o: "ô", u: "û",
      A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û"
    },
    '"': {
      a: "ä", e: "ë", i: "ï", o: "ö", u: "ü", y: "ÿ",
      A: "Ä", E: "Ë", I: "Ï", O: "Ö", U: "Ü"
    },
    "~": {
      a: "ã", n: "ñ", o: "õ",
      A: "Ã", N: "Ñ", O: "Õ"
    },
    c: {
      c: "ç", C: "Ç"
    }
  };

  let decoded = value;
  decoded = decoded
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-");
  decoded = decoded.replace(/\\[ij]\b/g, (command) => simpleCommands[command] || command);
  decoded = decoded.replace(/\\(aa|AA|ae|AE|oe|OE|o|O|ss|l|L|[&%$_])/g, (command) => simpleCommands[command] || command);
  decoded = decoded.replace(/\\(['`^"~c])\s*\{?\\?([A-Za-z])\}?/g, (_match, accent, letter) => {
    return accentMap[accent]?.[letter] || letter;
  });
  decoded = decoded.replace(/\{\\(['`^"~c])\s*\\?([A-Za-z])\}/g, (_match, accent, letter) => {
    return accentMap[accent]?.[letter] || letter;
  });
  decoded = decoded.replace(/[{}]/g, "");
  return decoded;
}

function shuffle(items) {
  return [...items].sort((a, b) => a.localeCompare(b));
}
