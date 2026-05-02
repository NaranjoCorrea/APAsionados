export function playTone(kind, enabled) {
  if (!enabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  const tones = {
    success: [523.25, 659.25],
    miss: [220, 196],
    unlock: [392, 523.25]
  };

  oscillator.frequency.value = tones[kind]?.[0] || 440;
  oscillator.type = "sine";
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();

  setTimeout(() => {
    oscillator.frequency.value = tones[kind]?.[1] || 440;
  }, 130);
  setTimeout(() => {
    oscillator.stop();
    context.close();
  }, 360);
}

let musicContext;
let musicNodes = [];
let musicTimer;
let musicPlaying = false;

const contestProgression = [
  { bass: 130.81, chord: [261.63, 329.63, 392.0, 523.25] },
  { bass: 174.61, chord: [261.63, 349.23, 440.0, 523.25] },
  { bass: 196.0, chord: [246.94, 392.0, 493.88, 587.33] },
  { bass: 130.81, chord: [261.63, 329.63, 392.0, 659.25] }
];

const contestMelody = [
  [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 523.25],
  [698.46, 880.0, 1046.5, 880.0, 783.99, 698.46, 659.25, 523.25],
  [783.99, 987.77, 1174.66, 987.77, 880.0, 783.99, 698.46, 587.33],
  [1046.5, 987.77, 880.0, 783.99, 659.25, 783.99, 880.0, 1046.5],
  [659.25, 783.99, 1046.5, 1174.66, 1046.5, 880.0, 783.99, 659.25],
  [698.46, 880.0, 1046.5, 1318.51, 1174.66, 1046.5, 880.0, 698.46],
  [783.99, 1046.5, 1174.66, 1318.51, 1567.98, 1318.51, 1046.5, 783.99]
];

export function startBackgroundMusic(enabled) {
  if (!enabled || musicPlaying) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  musicContext = musicContext || new AudioContext();
  if (musicContext.state === "suspended") {
    musicContext.resume();
  }

  musicPlaying = true;
  scheduleContestTheme();
}

export function stopBackgroundMusic() {
  musicPlaying = false;
  clearTimeout(musicTimer);
  musicTimer = undefined;
  musicNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // Already stopped.
    }
  });
  musicNodes = [];
}

export function toggleBackgroundMusic(enabled) {
  if (enabled) {
    startBackgroundMusic(true);
  } else {
    stopBackgroundMusic();
  }
}

function scheduleContestTheme() {
  if (!musicPlaying || !musicContext) return;
  const now = musicContext.currentTime;
  const master = musicContext.createGain();
  const compressor = musicContext.createDynamicsCompressor();
  const filter = musicContext.createBiquadFilter();
  const beat = 0.18;
  const barDuration = beat * 8;
  const themeDuration = barDuration * contestMelody.length;

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3400, now);
  compressor.threshold.setValueAtTime(-18, now);
  compressor.knee.setValueAtTime(18, now);
  compressor.ratio.setValueAtTime(8, now);
  compressor.attack.setValueAtTime(0.006, now);
  compressor.release.setValueAtTime(0.16, now);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.13, now + 0.025);
  master.gain.setValueAtTime(0.13, now + themeDuration - 0.18);
  master.gain.exponentialRampToValueAtTime(0.0001, now + themeDuration - 0.02);
  filter.connect(compressor);
  compressor.connect(master);
  master.connect(musicContext.destination);

  const nodes = [];

  contestMelody.forEach((melodyBar, barIndex) => {
    const barStart = now + barIndex * barDuration;
    const harmony = contestProgression[barIndex % contestProgression.length];

    for (let i = 0; i < 8; i += 1) {
      const start = barStart + i * beat;
      nodes.push(playMusicNote(harmony.bass * (i % 2 === 0 ? 1 : 1.5), start, 0.085, "square", 0.24, filter));
      nodes.push(playMusicNote(melodyBar[i], start + 0.055, 0.09, "triangle", 0.2, filter));
      if (i % 2 === 0) {
        nodes.push(playMusicNote(harmony.chord[(i / 2) % harmony.chord.length], start + 0.02, 0.16, "sine", 0.08, filter));
      }
    }

    harmony.chord.forEach((frequency, index) => {
      nodes.push(playMusicNote(frequency, barStart + index * 0.025, 0.28, "sine", 0.1, filter));
    });

    if (barIndex < contestMelody.length - 1) {
      nodes.push(playMusicNoise(barStart + 1.04, 0.05, 0.09, filter));
      nodes.push(playMusicNoise(barStart + 1.18, 0.05, 0.08, filter));
    }
  });

  nodes.push(playMusicNote(1046.5, now + themeDuration - 0.34, 0.12, "triangle", 0.2, filter));
  nodes.push(playMusicNote(1318.51, now + themeDuration - 0.2, 0.18, "triangle", 0.22, filter));
  nodes.push(playMusicNoise(now + themeDuration - 0.16, 0.08, 0.12, filter));

  musicNodes.push(...nodes);
  musicNodes = musicNodes.filter((node) => {
    try {
      return node.context.currentTime < now + themeDuration;
    } catch {
      return false;
    }
  });
  musicTimer = setTimeout(scheduleContestTheme, themeDuration * 1000);
}

function playMusicNote(frequency, start, duration, type, volume, destination) {
  const oscillator = musicContext.createOscillator();
  const gain = musicContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.015, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
  return oscillator;
}

function playMusicNoise(start, duration, volume, destination) {
  const bufferSize = Math.max(1, Math.floor(musicContext.sampleRate * duration));
  const buffer = musicContext.createBuffer(1, bufferSize, musicContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = musicContext.createBufferSource();
  const gain = musicContext.createGain();
  const filter = musicContext.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1800, start);
  noise.buffer = buffer;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  noise.start(start);
  noise.stop(start + duration);
  return noise;
}
