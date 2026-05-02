const STORAGE_KEY = "apasionados.progress.v1";

export const initialProgress = {
  points: 0,
  streak: 0,
  bestStreak: 0,
  completed: {},
  badges: [],
  unlockedLevels: [1],
  levelPracticePerfect: {},
  finished: false,
  apabullanteCompleted: false,
  attempts: [],
  settings: {
    sound: true,
    music: true,
    effects: true
  }
};

export function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...initialProgress,
      ...stored,
      unlockedLevels: stored?.unlockedLevels?.length ? stored.unlockedLevels : [1],
      levelPracticePerfect: stored?.levelPracticePerfect || {},
      settings: { ...initialProgress.settings, ...stored?.settings }
    };
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function levelUnlocked(level, progress) {
  return progress.unlockedLevels.includes(level.id);
}

export function getLevelScore(levelId, progress) {
  if (progress.badges?.length && progress.unlockedLevels?.includes(levelId + 1)) return 100;
  if (progress.finished && levelId === 3) return 100;
  if (progress.levelPracticePerfect?.[levelId]) return 70;
  return 0;
}
