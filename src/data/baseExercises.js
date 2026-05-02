export const levels = [
  {
    id: 1,
    title: "Primer flechazo",
    subtitle: "Orden, puntuación y formato visible",
    unlockAt: 0,
    bossTitle: "Duelo del apellido rebelde",
    badge: "Detective de formato",
    focus: ["autor", "año", "título", "cursiva", "puntuación"]
  },
  {
    id: 2,
    title: "Cita con DOI",
    subtitle: "Estructura, DOI/URL, volumen y páginas",
    unlockAt: 80,
    bossTitle: "La URL encantada",
    badge: "Arquitecta APA",
    focus: ["doi", "url", "volumen", "número", "páginas", "editores"]
  },
  {
    id: 3,
    title: "Relación complicada",
    subtitle: "Autores múltiples, instituciones y coherencia cita-referencia",
    unlockAt: 180,
    bossTitle: "La cita final",
    badge: "Maestría et al.",
    focus: ["autores múltiples", "autor institucional", "recuperación", "coherencia"]
  }
];

export const baseExercises = [
  {
    id: "n1-author-order",
    level: 1,
    type: "multiple-choice",
    prompt: "Detecta el error de formato APA en esta referencia de libro.",
    reference:
      "E. Mazur. (1997). *Peer instruction: A user's manual*. Prentice Hall.",
    options: [
      "El apellido debe ir antes de la inicial del nombre.",
      "El título del libro debe escribirse sin cursiva.",
      "La editorial debe ir antes del año.",
      "El año debe ir al final de la referencia."
    ],
    answer: "El apellido debe ir antes de la inicial del nombre.",
    solution: "Mazur, E. (1997). *Peer instruction: A user's manual*. Prentice Hall.",
    explanation:
      "En APA 7 las referencias empiezan por apellido, coma e inicial. En libros, además, el título va en cursiva."
  },
  {
    id: "n1-year-parentheses",
    level: 1,
    type: "fill-blank",
    prompt: "El año ya está dado. Escríbelo con el formato APA correcto.",
    before: "Freeman, S., Eddy, S. L., McDonough, M., Smith, M. K., Okoroafor, N., Jordt, H., & Wenderoth, M. P. ",
    after:
      ". Active learning increases student performance in science, engineering, and mathematics. *Proceedings of the National Academy of Sciences*, *111*(23), 8410-8415. https://doi.org/10.1073/pnas.1319030111",
    placeholder: "2014 con formato APA",
    answer: "(2014)",
    solution:
      "Freeman, S., Eddy, S. L., McDonough, M., Smith, M. K., Okoroafor, N., Jordt, H., & Wenderoth, M. P. (2014). Active learning increases student performance in science, engineering, and mathematics. *Proceedings of the National Academy of Sciences*, *111*(23), 8410-8415. https://doi.org/10.1073/pnas.1319030111",
    explanation:
      "El año de publicación se coloca entre paréntesis justo después de los autores. En artículos, el título del artículo no va en cursiva; sí van en cursiva el título de la revista y el volumen."
  },
  {
    id: "n1-order-book",
    level: 1,
    type: "order",
    prompt: "Ordena las piezas para construir una referencia básica de libro.",
    pieces: ["Routledge.", "*Visible learning: A synthesis of over 800 meta-analyses relating to achievement*.", "Hattie, J.", "(2009)."],
    answer: ["Hattie, J.", "(2009).", "*Visible learning: A synthesis of over 800 meta-analyses relating to achievement*.", "Routledge."],
    solution: "Hattie, J. (2009). *Visible learning: A synthesis of over 800 meta-analyses relating to achievement*. Routledge.",
    explanation:
      "La secuencia base para un libro es autor, año, título en cursiva y editorial. La cursiva identifica el contenedor principal de la obra."
  },
  {
    id: "n1-citation-basic",
    level: 1,
    type: "multiple-choice",
    prompt: "Según la referencia mostrada, elige el formato correcto de cita parentética.",
    reference: "Mazur, E. (1997). *Peer instruction: A user's manual*. Prentice Hall.",
    options: ["(Mazur, 1997)", "(E. Mazur, 1997)", "(Mazur 1997)", "(Mazur, E., 1997)"],
    answer: "(Mazur, 1997)",
    solution: "(Mazur, 1997)",
    explanation:
      "En la cita parentética se usa apellido y año separados por coma. Las iniciales no aparecen salvo casos de desambiguación."
  },
  {
    id: "n1-book-italics",
    level: 1,
    type: "multiple-choice",
    prompt: "¿Qué elemento debe ir en cursiva en esta referencia de libro?",
    reference: "Hattie, J. (2009). Visible learning: A synthesis of over 800 meta-analyses relating to achievement. Routledge.",
    options: [
      "El título del libro.",
      "El apellido del autor.",
      "La editorial.",
      "El año de publicación."
    ],
    answer: "El título del libro.",
    solution: "Hattie, J. (2009). *Visible learning: A synthesis of over 800 meta-analyses relating to achievement*. Routledge.",
    explanation:
      "En libros, el título de la obra va en cursiva. La editorial no va en cursiva y ya no se incluye la ciudad de publicación."
  },
  {
    id: "n1-title-case-book",
    level: 1,
    type: "spot-error",
    prompt: "Marca el fragmento que no respeta el uso de mayúsculas propio de APA 7 para el título de un libro.",
    fragments: [
      "Mazur, E. (1997).",
      "*Peer Instruction: A User's Manual*.",
      "Prentice Hall."
    ],
    answer: "*Peer Instruction: A User's Manual*.",
    solution: "Mazur, E. (1997). *Peer instruction: A user's manual*. Prentice Hall.",
    explanation:
      "En APA 7, los títulos de libros se escriben en estilo oración: mayúscula inicial y nombres propios. No se capitaliza cada palabra principal."
  },
  {
    id: "n1-narrative-citation",
    level: 1,
    type: "multiple-choice",
    prompt: "Según la referencia mostrada, elige la cita narrativa correcta.",
    reference: "Hattie, J. (2009). *Visible learning: A synthesis of over 800 meta-analyses relating to achievement*. Routledge.",
    options: [
      "Hattie (2009)",
      "Hattie, 2009",
      "J. Hattie (2009)",
      "*Visible learning* (2009)"
    ],
    answer: "Hattie (2009)",
    solution: "Hattie (2009)",
    explanation:
      "En cita narrativa, el apellido forma parte de la frase y el año queda entre paréntesis inmediatamente después."
  },
  {
    id: "boss-n1-format-combo",
    level: 1,
    boss: true,
    type: "spot-error",
    prompt: "Reto final: marca el fragmento que rompe el formato básico APA 7.",
    fragments: [
      "Hattie, J.",
      "2009.",
      "*Visible learning: A synthesis of over 800 meta-analyses relating to achievement*.",
      "Routledge."
    ],
    answer: "2009.",
    solution: "Hattie, J. (2009). *Visible learning: A synthesis of over 800 meta-analyses relating to achievement*. Routledge.",
    explanation:
      "En una referencia APA, el año va entre paréntesis tras la autoría. En libros, el título completo de la obra va en cursiva."
  },
  {
    id: "n2-doi-url",
    level: 2,
    type: "multiple-choice",
    prompt: "¿Qué habría que corregir en esta referencia de artículo?",
    reference:
      "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. doi:10.1002/j.2168-9830.2004.tb00809.x",
    options: [
      "El DOI debe aparecer como URL https://doi.org/...",
      "El nombre de la revista debe ir sin cursiva.",
      "El año debe ir detrás del título.",
      "Debe añadirse la ciudad de publicación."
    ],
    answer: "El DOI debe aparecer como URL https://doi.org/...",
    solution:
      "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
    explanation:
      "APA 7 recomienda presentar los DOI como enlaces URL completos, empezando por https://doi.org/. En artículos, el título de la revista y el volumen van en cursiva."
  },
  {
    id: "n2-pages-no-pp",
    level: 2,
    type: "spot-error",
    prompt: "Marca el fragmento que sobra en una referencia de artículo de revista.",
    fragments: [
      "Furtak, E. M., Seidel, T., Iverson, H., & Briggs, D. C. (2012).",
      "Experimental and quasi-experimental studies of inquiry-based science teaching: A meta-analysis.",
      "*Educational Researcher*, *41*(8),",
      "pp. 300-312.",
      "https://doi.org/10.3102/0034654312457206"
    ],
    answer: "pp. 300-312.",
    solution:
      "*Educational Researcher*, *41*(8), 300-312. https://doi.org/10.3102/0034654312457206",
    explanation:
      "En artículos de revista no se escribe 'pp.' antes del intervalo de páginas. Recuerda también la cursiva: título de revista y volumen sí; número y páginas no."
  },
  {
    id: "n2-volume-issue",
    level: 2,
    type: "order",
    prompt: "Ordena los datos finales de un artículo de revista.",
    pieces: [
      "*111*(23),",
      "8410-8415.",
      "*Proceedings of the National Academy of Sciences*,",
      "https://doi.org/10.1073/pnas.1319030111"
    ],
    answer: [
      "*Proceedings of the National Academy of Sciences*,",
      "*111*(23),",
      "8410-8415.",
      "https://doi.org/10.1073/pnas.1319030111"
    ],
    solution:
      "*Proceedings of the National Academy of Sciences*, *111*(23), 8410-8415. https://doi.org/10.1073/pnas.1319030111",
    explanation:
      "En artículos: revista, volumen(número), páginas y DOI. El volumen va en cursiva; el número no."
  },
  {
    id: "n2-article-title-not-italic",
    level: 2,
    type: "spot-error",
    prompt: "Marca el fragmento que tiene una cursiva incorrecta para una referencia de artículo.",
    fragments: [
      "Prince, M. (2004).",
      "*Does active learning work? A review of the research*.",
      "*Journal of Engineering Education*, *93*(3), 223-231.",
      "https://doi.org/10.1002/j.2168-9830.2004.tb00809.x"
    ],
    answer: "*Does active learning work? A review of the research*.",
    solution: "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
    explanation:
      "En artículos, el título del artículo no va en cursiva. Van en cursiva el título de la revista y el volumen."
  },
  {
    id: "n2-no-location",
    level: 2,
    type: "spot-error",
    prompt: "Marca el fragmento que sobra en esta referencia de libro en APA 7.",
    fragments: [
      "Hattie, J. (2009).",
      "*Visible learning: A synthesis of over 800 meta-analyses relating to achievement*.",
      "London:",
      "Routledge."
    ],
    answer: "London:",
    solution: "Hattie, J. (2009). *Visible learning: A synthesis of over 800 meta-analyses relating to achievement*. Routledge.",
    explanation:
      "APA 7 no incluye la localización de la editorial en referencias de libros. La referencia pasa directamente del título en cursiva a la editorial."
  },
  {
    id: "n2-conference-order",
    level: 2,
    type: "order",
    prompt: "Ordena los datos de fuente de esta comunicación de congreso.",
    pieces: [
      "En *Proceedings of the 15th International Academic MindTrek Conference: Envisioning Future Media Environments*",
      "(pp. 9-15).",
      "https://doi.org/10.1145/2181037.2181040"
    ],
    answer: [
      "En *Proceedings of the 15th International Academic MindTrek Conference: Envisioning Future Media Environments*",
      "(pp. 9-15).",
      "https://doi.org/10.1145/2181037.2181040"
    ],
    solution: "En *Proceedings of the 15th International Academic MindTrek Conference: Envisioning Future Media Environments* (pp. 9-15). https://doi.org/10.1145/2181037.2181040",
    explanation:
      "En contribuciones a congresos publicadas en actas, el título de las actas funciona como contenedor y va en cursiva; las páginas se indican con pp."
  },
  {
    id: "boss-n2-italics-and-container",
    level: 2,
    boss: true,
    type: "multiple-choice",
    prompt: "Reto final: ¿qué versión aplica mejor las cursivas en una referencia de artículo?",
    options: [
      "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
      "Prince, M. (2004). *Does active learning work? A review of the research*. Journal of Engineering Education, 93(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
      "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education, 93(3), 223-231*. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
      "Prince, M. (2004). Does active learning work? A review of the research. Journal of Engineering Education, *93(3), 223-231*. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x"
    ],
    answer:
      "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
    solution:
      "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x",
    explanation:
      "En artículos, el título del artículo no va en cursiva. Sí van en cursiva el título de la revista y el volumen; el número, las páginas y el DOI no."
  },
  {
    id: "n3-et-al-reference",
    level: 3,
    type: "multiple-choice",
    prompt: "¿Qué regla APA 7 se aplica si una referencia tiene 21 autores?",
    reference:
      "Kasneci, E., Sessler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., ... Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences*, *103*, Article 102274. https://doi.org/10.1016/j.lindif.2023.102274",
    options: [
      "Se listan los primeros 19 autores, puntos suspensivos y el último autor.",
      "Se listan solo los primeros 6 autores y luego et al.",
      "Se listan siempre todos los autores, sin límite.",
      "Se sustituye toda la autoría por el nombre de la revista."
    ],
    answer: "Se listan los primeros 19 autores, puntos suspensivos y el último autor.",
    solution:
      "Para 21 o más autores: autores 1-19, puntos suspensivos, último autor. No se usa et al. en la lista de referencias.",
    explanation:
      "APA 7 cambió la gestión de referencias con muchos autores: hasta 20 se incluyen todos; con 21 o más se omiten los autores intermedios. En la misma referencia, revista y volumen conservan la cursiva."
  },
  {
    id: "n3-retrieval",
    level: 3,
    type: "multiple-choice",
    prompt: "¿Cuándo se incluye fecha de recuperación en APA 7?",
    reference:
      "UNESCO. (2023). *Guidance for generative AI in education and research*. Recuperado el 23 de febrero de 2026, de https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    options: [
      "Solo cuando el contenido está diseñado para cambiar con el tiempo.",
      "Siempre que la fuente esté en internet.",
      "Nunca se incluye en APA 7.",
      "Solo cuando el autor es institucional."
    ],
    answer: "Solo cuando el contenido está diseñado para cambiar con el tiempo.",
    solution:
      "UNESCO. (2023). *Guidance for generative AI in education and research*. https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    explanation:
      "Si el recurso es estable, como un informe publicado, normalmente no se añade fecha de recuperación. El título del informe va en cursiva."
  },
  {
    id: "n3-citation-reference-match",
    level: 3,
    type: "multiple-choice",
    prompt: "¿Qué cita en texto corresponde mejor a esta referencia?",
    reference:
      "Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining “gamification”. En *Proceedings of the 15th International Academic MindTrek Conference: Envisioning Future Media Environments* (pp. 9-15). https://doi.org/10.1145/2181037.2181040",
    options: ["(Deterding et al., 2011)", "(*Proceedings of the 15th International Academic MindTrek Conference*, 2011)", "(MindTrek, 2011)", "(Deterding, Dixon, Khaled, & Nacke, pp. 9-15)"],
    answer: "(Deterding et al., 2011)",
    solution: "(Deterding et al., 2011)",
    explanation:
      "La cita en texto conecta con la primera parte de la referencia: el apellido del autor y el año."
  },
  {
    id: "n3-six-authors-citation",
    level: 3,
    type: "multiple-choice",
    prompt: "Según la referencia mostrada, elige la cita parentética correcta para APA 7.",
    reference: "Freeman, S., Eddy, S. L., McDonough, M., Smith, M. K., Okoroafor, N., Jordt, H., & Wenderoth, M. P. (2014). Active learning increases student performance in science, engineering, and mathematics. *Proceedings of the National Academy of Sciences*, *111*(23), 8410-8415. https://doi.org/10.1073/pnas.1319030111",
    options: [
      "(Freeman et al., 2014)",
      "(Freeman, Eddy, McDonough, Smith, Okoroafor, Jordt, & Wenderoth, 2014)",
      "(Proceedings of the National Academy of Sciences, 2014)",
      "(Freeman, pp. 8410-8415)"
    ],
    answer: "(Freeman et al., 2014)",
    solution: "(Freeman et al., 2014)",
    explanation:
      "En APA 7, las citas en texto de obras con tres o más autores usan el primer apellido seguido de et al. desde la primera cita."
  },
  {
    id: "n3-organization-author",
    level: 3,
    type: "multiple-choice",
    prompt: "¿Qué cita parentética corresponde a esta referencia con autor institucional?",
    reference: "UNESCO. (2023). *Guidance for generative AI in education and research*. https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    options: [
      "(UNESCO, 2023)",
      "(*Guidance for generative AI in education and research*, 2023)",
      "(unesdoc.unesco.org, 2023)",
      "(UNESCO, Recuperado 2026)"
    ],
    answer: "(UNESCO, 2023)",
    solution: "(UNESCO, 2023)",
    explanation:
      "Cuando la referencia empieza por una institución, la cita toma ese autor institucional y el año."
  },
  {
    id: "n3-reference-21-authors-error",
    level: 3,
    type: "spot-error",
    prompt: "Marca el fragmento problemático en una referencia de artículo con 21 o más autores.",
    fragments: [
      "Kasneci, E., Sessler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F.,",
      "et al.",
      "(2023). ChatGPT for good? On opportunities and challenges of large language models for education.",
      "*Learning and Individual Differences*, *103*, Article 102274."
    ],
    answer: "et al.",
    solution: "En la lista de referencias, para 21 o más autores se escriben los 19 primeros, puntos suspensivos y el último autor.",
    explanation:
      "Et al. se usa en citas en el texto, pero no sustituye así a la autoría en la lista de referencias."
  },
  {
    id: "boss-n3-citation-reference-integrated",
    level: 3,
    boss: true,
    type: "multiple-choice",
    prompt: "Reto final: elige la pareja cita-referencia más coherente y mejor formateada.",
    options: [
      "(UNESCO, 2023) | UNESCO. (2023). *Guidance for generative AI in education and research*. https://unesdoc.unesco.org/ark:/48223/pf0000386693",
      "(*Guidance for generative AI in education and research*, 2023) | UNESCO. (2023). Guidance for generative AI in education and research. https://unesdoc.unesco.org/ark:/48223/pf0000386693",
      "(UNESCO, s. f.) | UNESCO. (2023). *Guidance for generative AI in education and research*. Recuperado siempre de https://unesdoc.unesco.org/ark:/48223/pf0000386693",
      "(Guidance, 2023) | UNESCO. (2023). *Guidance for generative AI in education and research*. Editorial UNESCO. https://unesdoc.unesco.org/ark:/48223/pf0000386693"
    ],
    answer:
      "(UNESCO, 2023) | UNESCO. (2023). *Guidance for generative AI in education and research*. https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    solution:
      "(UNESCO, 2023) | UNESCO. (2023). *Guidance for generative AI in education and research*. https://unesdoc.unesco.org/ark:/48223/pf0000386693",
    explanation:
      "La cita debe tomar la autoría y el año del inicio de la referencia. En informes, el título va en cursiva; no se añade fecha de recuperación si el documento es estable."
  }
];
