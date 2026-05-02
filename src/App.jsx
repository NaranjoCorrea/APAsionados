import React, { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  CircleOff,
  Download,
  HeadphoneOff,
  Lock,
  Music,
  RotateCcw,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X
} from "lucide-react";
import logo from "./assets/APAsionadosLogo.png";
import titleImage from "./assets/APAsionadosTitle.png";
import fondo from "./assets/APAsionadosFondo.png";
import celebrationVideo from "./assets/APAsionadosCelebracion.mp4";
import { baseExercises, levels } from "./data/baseExercises.js";
import { catalogSources } from "./data/catalogSources.js";
import { exercisesFromBibtex, exercisesFromEntries } from "./lib/bibtex.js";
import {
  getLevelScore,
  initialProgress,
  levelUnlocked,
  loadProgress,
  resetProgress,
  saveProgress
} from "./lib/progress.js";
import { playTone, startBackgroundMusic, stopBackgroundMusic, toggleBackgroundMusic } from "./lib/sound.js";

const PASSING_BOSS_SCORE = 1;
const PRACTICE_QUESTIONS_PER_LEVEL = 4;
const AUTHOR_NAME = "Francisco Luis Naranjo Correa";
const APABULLANTE_LEVEL = {
  id: "APAbullante",
  title: "Reto APAbullante",
  bossTitle: "Reto APAbullante",
  badge: "Leyenda APAbullante"
};
const APABULLANTE_EXERCISE = {
  id: "reto-apabullante-kasneci",
  level: "APAbullante",
  type: "multiple-choice",
  prompt:
    "Reto APAbullante: esta referencia tiene un problema avanzado de autoría APA 7. Elige el diagnóstico más completo.",
  reference:
    "Kasneci, E., Sessler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., ... Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences*, *103*, Article 102274. https://doi.org/10.1016/j.lindif.2023.102274",
  options: [
    "La referencia es incorrecta: con 21 o más autores deben escribirse los 19 primeros, puntos suspensivos y el último autor; no basta con mostrar unos pocos autores y puntos suspensivos.",
    "La referencia es correcta porque APA 7 permite usar puntos suspensivos después del sexto autor en cualquier artículo.",
    "La referencia es incorrecta solo porque el título del artículo debería ir en cursiva.",
    "La referencia es incorrecta porque en APA 7 siempre debe usarse et al. en la lista de referencias cuando hay más de tres autores."
  ],
  answer:
    "La referencia es incorrecta: con 21 o más autores deben escribirse los 19 primeros, puntos suspensivos y el último autor; no basta con mostrar unos pocos autores y puntos suspensivos.",
  solution:
    "En APA 7, si una obra tiene 21 o más autores, la referencia lista los 19 primeros autores, añade puntos suspensivos y termina con el último autor. En la lista de referencias no se sustituye la autoría por et al.",
  explanation:
    "Este es un caso avanzado porque mezcla una regla de autoría larga con formato de artículo: título del artículo sin cursiva, revista y volumen en cursiva, artículo identificador y DOI como URL."
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [progress, setProgress] = useState(loadProgress);
  const [generatedExercises, setGeneratedExercises] = useState([]);
  const [importMessage, setImportMessage] = useState("");
  const [activeLevel, setActiveLevel] = useState(null);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mode, setMode] = useState("practice");
  const [runMessage, setRunMessage] = useState("");
  const [badgeToast, setBadgeToast] = useState(null);
  const bossCorrectRef = useRef(0);
  const levelRunCorrectRef = useRef(0);

  useEffect(() => {
    saveProgress(progress);
    toggleBackgroundMusic(progress.settings.music);
  }, [progress]);

  useEffect(() => {
    return () => stopBackgroundMusic();
  }, []);

  const exercises = useMemo(() => {
    const catalogExercises = exercisesFromEntries(catalogSources);
    const defaultExercises = [...baseExercises, ...catalogExercises];
    const merged = generatedExercises.length >= 6 ? generatedExercises : [...generatedExercises, ...defaultExercises];
    return merged;
  }, [generatedExercises]);

  const currentExercise = sessionExercises[currentIndex];

  function startLevel(level, nextMode = "practice") {
    startBackgroundMusic(progress.settings.music);
    const candidates = exercises.filter((exercise) => exercise.level === level.id);
    const bossExercise = baseExercises.find((exercise) => exercise.level === level.id && exercise.boss);
    const nextExercises =
      nextMode === "boss"
        ? [bossExercise || candidates.find((exercise) => exercise.boss) || candidates.filter((exercise) => !exercise.generated).slice(-1)[0]].filter(Boolean).map(prepareExercise)
        : pickRandom(candidates.filter((exercise) => !exercise.boss), PRACTICE_QUESTIONS_PER_LEVEL).map(prepareExercise);

    setActiveLevel(level);
    setMode(nextMode);
    setSessionExercises(nextExercises);
    setCurrentIndex(0);
    setAnswer(null);
    setChecked(false);
    setIsCorrect(false);
    setRunMessage("");
    bossCorrectRef.current = 0;
    levelRunCorrectRef.current = 0;
    setScreen("practice");
  }

  function startApabullante() {
    startBackgroundMusic(progress.settings.music);
    setActiveLevel(APABULLANTE_LEVEL);
    setMode("apabullante");
    setSessionExercises([prepareExercise(APABULLANTE_EXERCISE)]);
    setCurrentIndex(0);
    setAnswer(null);
    setChecked(false);
    setIsCorrect(false);
    setRunMessage("");
    setScreen("practice");
  }

  function updateSettings(nextSettings) {
    setProgress((current) => ({
      ...current,
      settings: { ...current.settings, ...nextSettings }
    }));
  }

  function submitAnswer() {
    if (!currentExercise || answer === null || answer === "" || checked) return;
    const correct = evaluateAnswer(currentExercise, answer);
    setChecked(true);
    setIsCorrect(correct);
    if (mode === "boss" && correct) {
      bossCorrectRef.current += 1;
    }
    if (mode === "practice" && correct) {
      levelRunCorrectRef.current += 1;
    }
    playTone(correct ? "success" : "miss", progress.settings.sound);

    setProgress((current) => {
      const points = correct ? (mode === "apabullante" ? 75 : mode === "boss" ? 25 : 10) : 0;
      const streak = correct ? current.streak + 1 : 0;
      const completed = {
        ...current.completed,
        [currentExercise.id]: {
          level: currentExercise.level,
          points: Math.max(points, current.completed[currentExercise.id]?.points || 0),
          correct
        }
      };
      const attempts = [
        ...current.attempts,
        {
          date: new Date().toISOString(),
          level: currentExercise.level,
          mode,
          exerciseId: currentExercise.id,
          prompt: currentExercise.prompt,
          context: buildExerciseContext(currentExercise),
          answer: Array.isArray(answer) ? answer.join(" | ") : answer,
          expected: Array.isArray(currentExercise.answer)
            ? currentExercise.answer.join(" | ")
            : currentExercise.answer,
          correct,
          explanation: currentExercise.explanation
        }
      ];
      return {
        ...current,
        points: current.points + points,
        streak,
        bestStreak: Math.max(current.bestStreak, streak),
        completed,
        attempts
      };
    });
  }

  function nextExercise() {
    if (currentIndex < sessionExercises.length - 1) {
      setCurrentIndex((value) => value + 1);
      setAnswer(null);
      setChecked(false);
      setIsCorrect(false);
      return;
    }

    if (mode === "practice") {
      const perfect = levelRunCorrectRef.current === sessionExercises.length;
      setProgress((current) => ({
        ...current,
        levelPracticePerfect: perfect
          ? { ...current.levelPracticePerfect, [activeLevel.id]: true }
          : current.levelPracticePerfect
      }));
      setRunMessage(
        perfect
          ? `Nivel ${activeLevel.id}: práctica perfecta. Reto final desbloqueado.`
          : `Nivel ${activeLevel.id}: necesitas acertar las ${PRACTICE_QUESTIONS_PER_LEVEL} preguntas de práctica para desbloquear el reto.`
      );
    }

    if (mode === "boss") {
      if (bossCorrectRef.current >= PASSING_BOSS_SCORE) {
        completeBoss(activeLevel);
        return;
      } else {
        setRunMessage(`Reto no superado. Repite la práctica perfecta del nivel ${activeLevel.id} y vuelve al duelo.`);
      }
    }

    if (mode === "apabullante") {
      if (isCorrect) {
        completeApabullante();
        return;
      }
      setRunMessage("El Reto APAbullante sigue invicto. Puedes volver a intentarlo desde el final del juego.");
      setScreen("end");
      return;
    }

    setScreen("home");
  }

  function completeApabullante() {
    setProgress((current) => {
      const badges = current.badges.includes(APABULLANTE_LEVEL.badge)
        ? current.badges
        : [...current.badges, APABULLANTE_LEVEL.badge];
      playTone("unlock", current.settings.sound);
      return {
        ...current,
        badges,
        apabullanteCompleted: true
      };
    });
    setBadgeToast({ badge: APABULLANTE_LEVEL.badge, level: "APAbullante", finished: true });
    setTimeout(() => setBadgeToast(null), 2600);
    setRunMessage("Reto APAbullante superado. Esto ya es amor bibliográfico serio.");
    setScreen("end");
  }

  function completeBoss(level) {
    const nextLevel = level.id + 1;
    const finished = level.id === levels.length;
    setProgress((current) => {
      const badges = current.badges.includes(level.badge) ? current.badges : [...current.badges, level.badge];
      const unlockedLevels =
        finished || current.unlockedLevels.includes(nextLevel)
          ? current.unlockedLevels
          : [...current.unlockedLevels, nextLevel];
      playTone("unlock", current.settings.sound);
      return {
        ...current,
        badges,
        unlockedLevels,
        finished: current.finished || finished
      };
    });
    setBadgeToast({ badge: level.badge, level: level.id, finished });
    setTimeout(() => setBadgeToast(null), 2600);
    setRunMessage(
      finished
        ? "Juego completado. Ya puedes ver tu resumen final."
        : `Insignia conseguida. Nivel ${nextLevel} desbloqueado.`
    );
    setScreen(finished ? "end" : "home");
  }

  function handleBibtexUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const created = exercisesFromBibtex(String(reader.result || ""));
      setGeneratedExercises(created);
      setImportMessage(
        created.length
          ? `${created.length} ejercicios generados desde ${file.name}.`
          : "No he podido detectar referencias BibTeX válidas en ese archivo."
      );
    };
    reader.readAsText(file);
  }

  async function exportReport() {
    await downloadPdfReport(progress, stats);
  }

  function clearProgress() {
    resetProgress();
    setProgress(initialProgress);
    setRunMessage("");
    setScreen("home");
  }

  const stats = getStats(progress);

  if (screen === "cheat") {
    return (
      <Shell progress={progress} onHome={() => setScreen("home")} onSettings={updateSettings}>
        <CheatSheet onBack={() => setScreen("home")} />
      </Shell>
    );
  }

  if (screen === "end") {
    return (
      <Shell progress={progress} onHome={() => setScreen("home")} onSettings={updateSettings}>
        <EndScreen
          progress={progress}
          stats={stats}
          onDownload={exportReport}
          onHome={() => setScreen("home")}
          onApabullante={startApabullante}
        />
        {badgeToast && <BadgeToast badge={badgeToast.badge} finished={badgeToast.finished} />}
      </Shell>
    );
  }

  if (screen === "practice" && activeLevel && currentExercise) {
    return (
      <Shell progress={progress} onHome={() => setScreen("home")} onSettings={updateSettings}>
        <PracticeScreen
          level={activeLevel}
          exercise={currentExercise}
          index={currentIndex}
          total={sessionExercises.length}
          answer={answer}
          setAnswer={setAnswer}
          checked={checked}
          isCorrect={isCorrect}
          onSubmit={submitAnswer}
          onNext={nextExercise}
          onExit={() => setScreen("home")}
          effects={progress.settings.effects}
          mode={mode}
        />
        {badgeToast && <BadgeToast badge={badgeToast.badge} finished={badgeToast.finished} />}
      </Shell>
    );
  }

  return (
    <Shell progress={progress} onHome={() => setScreen("home")} onSettings={updateSettings}>
      <main className="home">
        <section className="hero" aria-labelledby="main-title">
          <div className="hero-copy">
            <button
              className="logo-sound"
              onClick={() => {
                playTone("unlock", progress.settings.sound);
                startBackgroundMusic(progress.settings.music);
              }}
              title="Probar sonido e iniciar música"
              aria-label="Probar sonido e iniciar música"
            >
              <img src={logo} alt="APAsionados" className="hero-logo" />
            </button>
            <h1 id="main-title">¿Cuánto sabes sobre APA 7?</h1>
            <p>
              Citas en texto, referencias finales y coherencia entre ambas. Responde, revisa la
              solución explicada y sube de nivel.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={() => startLevel(levels[0])}>
                <Sparkles size={20} aria-hidden="true" />
                Empezar juego
              </button>
              <button className="secondary" onClick={() => setScreen("cheat")}>
                <BookOpen size={20} aria-hidden="true" />
                Chuleta APA
              </button>
            </div>
          </div>
          <img src={titleImage} alt="" className="hero-art" />
        </section>

        <section className="toolbar" aria-label="Herramientas de práctica">
          <label className="import-card">
            <Upload size={22} aria-hidden="true" />
            <span>
              <strong>Importar BibTeX</strong>
              <small>Genera ejercicios de todos los niveles.</small>
            </span>
            <input type="file" accept=".bib,.txt" onChange={handleBibtexUpload} />
          </label>
          <button className="tool-button" onClick={exportReport}>
            <Download size={20} aria-hidden="true" />
            Exportar informe
          </button>
          <button className="tool-button danger" onClick={clearProgress}>
            <RotateCcw size={20} aria-hidden="true" />
            Reiniciar
          </button>
        </section>

        {importMessage && <p className="status-message">{importMessage}</p>}
        {runMessage && <p className="status-message">{runMessage}</p>}
        {progress.finished && (
          <section className="finish-callout">
            <div>
              <strong>Fin de juego alcanzado</strong>
              <span>Has completado los tres niveles de APAsionados.</span>
            </div>
            <button className="primary" onClick={() => setScreen("end")}>
              Ver resumen final
            </button>
          </section>
        )}

        <section className="levels" aria-label="Niveles">
          {levels.map((level) => {
            const unlocked = levelUnlocked(level, progress);
            const levelScore = getLevelScore(level.id, progress);
            const readyForBoss = Boolean(progress.levelPracticePerfect[level.id]);
            return (
              <article className={`level-card ${unlocked ? "" : "locked"}`} key={level.id}>
                <div className="level-heading">
                  <span className="level-number">Nivel {level.id}</span>
                  {unlocked ? <Award size={22} aria-hidden="true" /> : <Lock size={22} aria-hidden="true" />}
                </div>
                <h2>{level.title}</h2>
                <p>{level.subtitle}</p>
                <div className="focus-list">
                  {level.focus.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <progress max="100" value={Math.min(100, levelScore)} aria-label={`Progreso del nivel ${level.id}`} />
                <p className="level-status">
                  {readyForBoss ? "Reto final listo" : `Acierta ${PRACTICE_QUESTIONS_PER_LEVEL}/4 para abrir el reto`}
                </p>
                <div className="level-actions">
                  <button disabled={!unlocked} onClick={() => startLevel(level)}>
                    Jugar ronda
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                  <button disabled={!unlocked || !readyForBoss} className="boss" onClick={() => startLevel(level, "boss")}>
                    <Wand2 size={18} aria-hidden="true" />
                    Reto final
                  </button>
                </div>
              </article>
            );
          })}
        </section>
        {badgeToast && <BadgeToast badge={badgeToast.badge} finished={badgeToast.finished} />}
      </main>
    </Shell>
  );
}

function EndScreen({ progress, stats, onDownload, onHome, onApabullante }) {
  return (
    <main className="end-screen">
      <section className="end-hero">
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 28 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="final-burst" aria-hidden="true">
          <span>APA</span>
        </div>
        <video className="celebration-media" src={celebrationVideo} autoPlay loop muted playsInline aria-label="Animación de celebración de APAsionados" />
        <Award size={58} aria-hidden="true" />
        <h1>Fin de juego</h1>
        <p>Has completado APAsionados: citas, referencias, cursivas y et al. quedan bajo control.</p>
        <div className="end-stats">
          <article>
            <strong>{progress.points}</strong>
            <span>Puntos</span>
          </article>
          <article>
            <strong>{stats.correct}/{stats.total}</strong>
            <span>Aciertos</span>
          </article>
          <article>
            <strong>{stats.accuracy}%</strong>
            <span>Precisión</span>
          </article>
          <article>
            <strong>{progress.bestStreak}</strong>
            <span>Mejor racha</span>
          </article>
        </div>
        <div className="badge-row" aria-label="Insignias conseguidas">
          {progress.badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <div className="hero-actions">
          <button className="primary apabullante-button" onClick={onApabullante}>
            <Wand2 size={20} aria-hidden="true" />
            {progress.apabullanteCompleted ? "Repetir Reto APAbullante" : "Superar Reto APAbullante"}
          </button>
          <button className="primary" onClick={onDownload}>
            <Download size={20} aria-hidden="true" />
            Descargar resultados
          </button>
          <button className="secondary" onClick={onHome}>
            Volver al menú
          </button>
        </div>
      </section>
    </main>
  );
}

function BadgeToast({ badge, finished }) {
  return (
    <div className={`badge-toast ${finished ? "final" : ""}`} role="status" aria-live="polite">
      <Award size={44} aria-hidden="true" />
      <div>
        <strong>{finished ? "Juego completado" : "Insignia conseguida"}</strong>
        <span>{badge}</span>
      </div>
    </div>
  );
}

function Shell({ children, progress, onHome, onSettings }) {
  const stats = getStats(progress);
  return (
    <div className="app" style={{ backgroundImage: `linear-gradient(rgba(8, 14, 31, .74), rgba(8, 14, 31, .84)), url(${fondo})` }}>
      <header className="topbar">
        <button className="brand" onClick={onHome} aria-label="Volver al inicio">
          <img src={logo} alt="" />
          <span>APAsionados</span>
        </button>
        <div className="stats" aria-label="Progreso">
          <StatPill
            label={`${progress.points} puntos`}
            title="Puntuación"
            lines={[
              `${stats.correct} aciertos de ${stats.total} intentos`,
              `${stats.accuracy}% de precisión`,
              `${progress.completed ? Object.keys(progress.completed).length : 0} ejercicios puntuados`
            ]}
          />
          <StatPill
            label={`Racha ${progress.streak}`}
            title="Racha"
            lines={[
              `Racha actual: ${progress.streak}`,
              `Mejor racha: ${progress.bestStreak}`,
              progress.streak >= 4 ? "Ritmo perfecto de ronda" : "Acierta varias seguidas para subir la racha"
            ]}
          />
          <StatPill
            label={`${progress.badges.length} insignias`}
            title="Insignias y niveles"
            lines={[
              `Niveles desbloqueados: ${progress.unlockedLevels.join(", ")}`,
              progress.badges.length ? progress.badges.join(" · ") : "Todavía no hay insignias",
              progress.finished ? "Juego completado" : "Supera retos finales para ganar insignias"
            ]}
          />
        </div>
        <div className="settings">
          <button
            className="icon-toggle"
            title={progress.settings.sound ? "Sonido: activado" : "Sonido: silenciado"}
            onClick={() => onSettings({ sound: !progress.settings.sound })}
            aria-label={progress.settings.sound ? "Silenciar efectos de sonido" : "Activar efectos de sonido"}
          >
            {progress.settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="control-label">Sonido</span>
          </button>
          <button
            className="icon-toggle"
            title={progress.settings.music ? "Música: activada" : "Música: silenciada"}
            onClick={() => onSettings({ music: !progress.settings.music })}
            aria-label={progress.settings.music ? "Silenciar música de fondo" : "Activar música de fondo"}
          >
            {progress.settings.music ? <Music size={20} /> : <HeadphoneOff size={20} />}
            <span className="control-label">Música</span>
          </button>
          <button
            className="icon-toggle"
            title={progress.settings.effects ? "Efectos: activados" : "Efectos: reducidos"}
            onClick={() => onSettings({ effects: !progress.settings.effects })}
            aria-label={progress.settings.effects ? "Reducir efectos" : "Activar efectos"}
          >
            {progress.settings.effects ? <Sparkles size={20} /> : <CircleOff size={20} />}
            <span className="control-label">Efectos</span>
          </button>
        </div>
      </header>
      {children}
      <footer className="app-credit">
        APAsionados · © 2026 {AUTHOR_NAME}
      </footer>
    </div>
  );
}

function StatPill({ label, title, lines }) {
  return (
    <span className="stat-pill" tabIndex="0">
      {label}
      <span className="stat-popover" role="tooltip">
        <strong>{title}</strong>
        {lines.map((line) => (
          <small key={line}>{line}</small>
        ))}
      </span>
    </span>
  );
}

function pickRandom(items, count) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  if (shuffled.length >= count) return shuffled.slice(0, count);
  return shuffled;
}

function prepareExercise(exercise) {
  if (exercise.options) {
    return { ...exercise, options: pickRandom(exercise.options, exercise.options.length) };
  }
  if (exercise.fragments) {
    return { ...exercise, fragments: pickRandom(exercise.fragments, exercise.fragments.length) };
  }
  if (exercise.pieces) {
    return { ...exercise, pieces: pickRandom(exercise.pieces, exercise.pieces.length) };
  }
  return exercise;
}

function buildExerciseContext(exercise) {
  const parts = [];
  if (exercise.reference) parts.push(`Referencia: ${exercise.reference}`);
  if (exercise.options?.length) parts.push(`Opciones: ${exercise.options.join(" || ")}`);
  if (exercise.fragments?.length) parts.push(`Fragmentos: ${exercise.fragments.join(" || ")}`);
  if (exercise.pieces?.length) parts.push(`Piezas: ${exercise.pieces.join(" || ")}`);
  if (exercise.before || exercise.after) {
    parts.push(`Enunciado editable: ${exercise.before || ""} [respuesta] ${exercise.after || ""}`);
  }
  return parts.join("\n");
}

function getStats(progress) {
  const total = progress.attempts.length;
  const correct = progress.attempts.filter((attempt) => attempt.correct).length;
  return {
    total,
    correct,
    accuracy: total ? Math.round((correct / total) * 100) : 0
  };
}

function PracticeScreen({
  level,
  exercise,
  index,
  total,
  answer,
  setAnswer,
  checked,
  isCorrect,
  onSubmit,
  onNext,
  onExit,
  effects,
  mode
}) {
  const solutionRef = useRef(null);

  useEffect(() => {
    if (!checked || !solutionRef.current) return;
    const isNarrowScreen = window.matchMedia("(max-width: 900px)").matches;
    if (!isNarrowScreen) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() => {
      solutionRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  }, [checked, exercise.id]);

  return (
    <main className={`practice ${checked && isCorrect && effects ? "celebrate" : ""}`}>
      <section className="exercise-panel">
        <div className="exercise-kicker">
          <span>{mode === "boss" ? level.bossTitle : level.title}</span>
          <span>
            {index + 1}/{total}
          </span>
        </div>
        <button className="exit-round" onClick={onExit}>
          Salir al menú
        </button>
        <h1>{exercise.prompt}</h1>
        {exercise.reference && (
          <blockquote>
            <InlineText text={exercise.reference} />
          </blockquote>
        )}
        <ExerciseInput exercise={exercise} answer={answer} setAnswer={setAnswer} disabled={checked} />
        <div className="practice-actions">
          <button className="primary" onClick={onSubmit} disabled={checked || answer === null || answer === ""}>
            Comprobar
          </button>
          {checked && (
            <button className="secondary" onClick={onNext}>
              {index < total - 1 ? "Siguiente" : "Terminar"}
            </button>
          )}
        </div>
      </section>

      {checked && (
        <aside ref={solutionRef} className={`solution ${isCorrect ? "right" : "wrong"}`} aria-live="polite">
          <div className="solution-title">
            {isCorrect ? <Check size={22} aria-hidden="true" /> : <X size={22} aria-hidden="true" />}
            <h2>{isCorrect ? "Buen flechazo" : "Revisa la cita"}</h2>
          </div>
          <p className="expected">
            <strong>Solución:</strong> <InlineText text={exercise.solution} />
          </p>
          <p>
            <InlineText text={exercise.explanation} />
          </p>
        </aside>
      )}
    </main>
  );
}

function ExerciseInput({ exercise, answer, setAnswer, disabled }) {
  if (exercise.type === "multiple-choice") {
    return (
      <div className="options">
        {exercise.options.map((option) => (
          <button
            className={answer === option ? "selected" : ""}
            key={option}
            disabled={disabled}
            onClick={() => setAnswer(option)}
          >
            <InlineText text={option} />
          </button>
        ))}
      </div>
    );
  }

  if (exercise.type === "fill-blank") {
    return (
      <label className="fill">
        <span><InlineText text={exercise.before} /></span>
        <input
          value={answer || ""}
          disabled={disabled}
          placeholder={exercise.placeholder}
          onChange={(event) => setAnswer(event.target.value)}
        />
        <span><InlineText text={exercise.after} /></span>
      </label>
    );
  }

  if (exercise.type === "spot-error") {
    return (
      <div className="fragments">
        {exercise.fragments.map((fragment) => (
          <button
            className={answer === fragment ? "selected" : ""}
            key={fragment}
            disabled={disabled}
            onClick={() => setAnswer(fragment)}
          >
            <InlineText text={fragment} />
          </button>
        ))}
      </div>
    );
  }

  if (exercise.type === "order") {
    const selected = Array.isArray(answer) ? answer : [];
    const remaining = exercise.pieces.filter((piece) => !selected.includes(piece));
    return (
      <div className="ordering">
        <div className="drop-zone" aria-label="Orden elegido">
          {selected.length === 0 && <span>Elige piezas en orden</span>}
          {selected.map((piece) => (
            <button key={piece} disabled={disabled} onClick={() => setAnswer(selected.filter((item) => item !== piece))}>
              <InlineText text={piece} />
            </button>
          ))}
        </div>
        <div className="piece-bank" aria-label="Piezas disponibles">
          {remaining.map((piece) => (
            <button key={piece} disabled={disabled} onClick={() => setAnswer([...selected, piece])}>
              <InlineText text={piece} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function CheatSheet({ onBack }) {
  const items = [
    ["Libro", "Mazur, E. (1997). *Peer instruction: A user's manual*. Prentice Hall."],
    ["Cita parentética", "Para Mazur (1997): (Mazur, 1997). Apellido y año, separados por coma."],
    ["Cita narrativa", "Mazur (1997) propone... El año queda entre paréntesis justo después del apellido."],
    ["Artículo con DOI", "Prince, M. (2004). Does active learning work? A review of the research. *Journal of Engineering Education*, *93*(3), 223-231. https://doi.org/10.1002/j.2168-9830.2004.tb00809.x"],
    ["Informe", "UNESCO. (2023). *Guidance for generative AI in education and research*. https://unesdoc.unesco.org/ark:/48223/pf0000386693"],
    ["Capítulo o congreso", "Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining “gamification”. En *Proceedings of the 15th International Academic MindTrek Conference* (pp. 9-15). https://doi.org/10.1145/2181037.2181040"],
    ["Cursivas clave", "En los ejemplos: van en cursiva *Peer instruction*, *Journal of Engineering Education*, *93* y *Guidance for generative AI in education and research*. No van en cursiva el título del artículo, el número (3), las páginas ni el DOI."],
    ["Autores múltiples", "Para Deterding, Dixon, Khaled y Nacke (2011), la cita parentética habitual es (Deterding et al., 2011)."],
    ["Recuperación", "En el informe de UNESCO (2023), no se añade fecha de recuperación si el documento es estable."],
    ["Coherencia", "La cita (Prince, 2004) debe remitir a una referencia que empiece por Prince, M. y tenga el año 2004."]
  ];

  return (
    <main className="cheat">
      <section>
        <div className="section-title">
          <div className="title-group">
            <BookOpen size={26} aria-hidden="true" />
            <h1>Chuleta APA 7</h1>
          </div>
          <button className="secondary compact" onClick={onBack}>
            Volver al menú
          </button>
        </div>
        <div className="cheat-grid">
          {items.map(([title, body]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p><InlineText text={body} /></p>
            </article>
          ))}
        </div>
        <button className="secondary mobile-back" onClick={onBack}>
          Volver al menú
        </button>
      </section>
    </main>
  );
}

function InlineText({ text }) {
  return String(text)
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return <span key={index}>{part}</span>;
    });
}

function evaluateAnswer(exercise, answer) {
  if (Array.isArray(exercise.answer)) {
    return Array.isArray(answer) && exercise.answer.join("||") === answer.join("||");
  }
  return normalize(answer) === normalize(exercise.answer);
}

function normalize(value) {
  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
}

async function downloadPdfReport(progress, stats) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const reportPage = { pageWidth, pageHeight, margin, logoData: null };
  const logoData = await imageToDataUrl(logo);
  reportPage.logoData = logoData;

  drawPdfHeader(pdf, logoData, pageWidth, margin);
  pdf.setTextColor(181, 29, 40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("Informe APAsionados", margin, 54);

  pdf.setTextColor(23, 32, 51);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`Generado: ${new Date().toLocaleString("es-ES")}`, margin, 62);

  drawStatCards(pdf, progress, stats, margin, 82);

  let y = 126;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(23, 32, 51);
  pdf.text("Detalle de práctica", margin, y);
  y += 8;

  const attempts = progress.attempts.length ? progress.attempts : [{
    date: new Date().toISOString(),
    level: "-",
    mode: "practice",
    prompt: "Todavía no hay práctica registrada.",
    context: "",
    answer: "-",
    expected: "-",
    correct: false,
    explanation: "Juega una ronda para generar datos de aprendizaje."
  }];

  attempts.forEach((attempt, index) => {
    y = ensurePdfSpace(pdf, y, 20, reportPage);

    const result = attempt.correct ? "Correcto" : "Revisar";
    const modeLabel = attempt.mode === "apabullante" ? "Reto APAbullante" : attempt.mode === "boss" ? "Reto final" : "Ronda";
    const title = `${index + 1}. Nivel ${attempt.level} · ${modeLabel} · ${result}`;
    pdf.setFillColor(attempt.correct ? 232 : 255, attempt.correct ? 247 : 236, attempt.correct ? 239 : 236);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(attempt.correct ? 19 : 181, attempt.correct ? 111 : 29, attempt.correct ? 69 : 40);
    pdf.text(title, margin + 3, y + 5.3);
    y += 12;

    y = writeWrapped(pdf, `Ejercicio: ${stripMarkup(attempt.prompt)}`, margin, y, pageWidth - margin * 2, 9, reportPage);
    if (attempt.context) {
      y = writeWrapped(pdf, `Contexto: ${stripMarkup(attempt.context)}`, margin, y, pageWidth - margin * 2, 9, reportPage);
    }
    y = writeWrapped(pdf, `Respuesta: ${stripMarkup(attempt.answer)}`, margin, y, pageWidth - margin * 2, 9, reportPage);
    y = writeWrapped(pdf, `Esperado: ${stripMarkup(attempt.expected)}`, margin, y, pageWidth - margin * 2, 9, reportPage);
    y = writeWrapped(pdf, `Explicación: ${stripMarkup(attempt.explanation)}`, margin, y, pageWidth - margin * 2, 9, reportPage);
    y += 4;
  });

  addPdfFooter(pdf, pageWidth, pageHeight);
  pdf.save("informe-apasionados.pdf");
}

function drawPdfHeader(pdf, logoData, pageWidth, margin) {
  pdf.setFillColor(8, 16, 31);
  pdf.rect(0, 0, pageWidth, 34, "F");
  pdf.addImage(logoData, "PNG", margin, 6, 34, 22);
  pdf.setTextColor(255, 248, 236);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("APAsionados", pageWidth - margin, 17, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text("Práctica gamificada de citas y referencias APA 7", pageWidth - margin, 23, { align: "right" });
}

function drawStatCards(pdf, progress, stats, margin, y) {
  const cards = [
    ["Puntos", progress.points],
    ["Aciertos", `${stats.correct}/${stats.total}`],
    ["Precisión", `${stats.accuracy}%`],
    ["Mejor racha", progress.bestStreak]
  ];
  const cardWidth = 42;
  cards.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + 4);
    pdf.setFillColor(238, 243, 251);
    pdf.setDrawColor(216, 222, 234);
    pdf.roundedRect(x, y, cardWidth, 24, 3, 3, "FD");
    pdf.setTextColor(181, 29, 40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(String(value), x + cardWidth / 2, y + 10, { align: "center" });
    pdf.setTextColor(23, 32, 51);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.text(label, x + cardWidth / 2, y + 18, { align: "center" });
  });

  pdf.setTextColor(23, 32, 51);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const badges = progress.badges.length ? progress.badges.join(" · ") : "Sin insignias todavía";
  pdf.text(`Insignias: ${badges}`, margin, y + 34);
}

function addPdfFooter(pdf, pageWidth, pageHeight) {
  pdf.setDrawColor(216, 222, 234);
  pdf.line(16, pageHeight - 14, pageWidth - 16, pageHeight - 14);
  pdf.setTextColor(90, 98, 115);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(`APAsionados · © 2026 ${AUTHOR_NAME}`, 16, pageHeight - 8);
  pdf.text(`Página ${pdf.internal.getNumberOfPages()}`, pageWidth - 16, pageHeight - 8, { align: "right" });
}

function addPdfContinuationPage(pdf, reportPage) {
  addPdfFooter(pdf, reportPage.pageWidth, reportPage.pageHeight);
  pdf.addPage();
  drawPdfHeader(pdf, reportPage.logoData, reportPage.pageWidth, reportPage.margin);
  return 44;
}

function ensurePdfSpace(pdf, y, requiredHeight, reportPage) {
  const contentBottom = reportPage.pageHeight - 24;
  if (y + requiredHeight <= contentBottom) return y;
  return addPdfContinuationPage(pdf, reportPage);
}

function writeWrapped(pdf, text, x, y, width, lineHeight, reportPage) {
  pdf.setTextColor(23, 32, 51);
  pdf.setFont("helvetica", text.startsWith("Ejercicio:") ? "bold" : "normal");
  pdf.setFontSize(9);
  const lines = pdf.splitTextToSize(text, width);
  const contentBottom = reportPage.pageHeight - 24;
  let cursorY = y;
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    if (cursorY + lineHeight > contentBottom) {
      cursorY = addPdfContinuationPage(pdf, reportPage);
      pdf.setTextColor(23, 32, 51);
      pdf.setFont("helvetica", text.startsWith("Ejercicio:") ? "bold" : "normal");
      pdf.setFontSize(9);
    }

    const availableLines = Math.max(1, Math.floor((contentBottom - cursorY) / lineHeight));
    const pageLines = lines.slice(lineIndex, lineIndex + availableLines);
    pdf.text(pageLines, x, cursorY);
    cursorY += pageLines.length * lineHeight;
    lineIndex += pageLines.length;
  }

  return cursorY;
}

function stripMarkup(value) {
  return String(value || "").replace(/\*([^*]+)\*/g, "$1");
}

function imageToDataUrl(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = src;
  });
}
