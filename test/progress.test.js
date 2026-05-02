import test from "node:test";
import assert from "node:assert/strict";
import { baseExercises, levels } from "../src/data/baseExercises.js";
import { getLevelScore, initialProgress, levelUnlocked } from "../src/lib/progress.js";

test("cada nivel tiene al menos cuatro ejercicios de práctica y un reto final", () => {
  for (const level of levels) {
    const levelExercises = baseExercises.filter((exercise) => exercise.level === level.id);
    const practice = levelExercises.filter((exercise) => !exercise.boss);
    const boss = levelExercises.filter((exercise) => exercise.boss);

    assert.ok(practice.length >= 4, `Nivel ${level.id} necesita al menos cuatro ejercicios`);
    assert.equal(boss.length, 1, `Nivel ${level.id} debe tener un reto final`);
  }
});

test("levelUnlocked respeta los niveles desbloqueados", () => {
  assert.equal(levelUnlocked(levels[0], initialProgress), true);
  assert.equal(levelUnlocked(levels[1], initialProgress), false);
});

test("getLevelScore refleja práctica perfecta, desbloqueo y fin de juego", () => {
  assert.equal(getLevelScore(1, { ...initialProgress, levelPracticePerfect: { 1: true } }), 70);
  assert.equal(getLevelScore(1, { ...initialProgress, badges: ["Detective de formato"], unlockedLevels: [1, 2] }), 100);
  assert.equal(getLevelScore(3, { ...initialProgress, finished: true }), 100);
});
