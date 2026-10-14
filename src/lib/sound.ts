/** Procedural retro audio (Web Audio API): no files to download, works offline-cached. */
let ctx: AudioContext | null = null;
let enabled = false;
let bgmTimer: ReturnType<typeof setTimeout> | undefined;
let bgmOn = false;

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) { const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

const NOTE: Record<string, number> = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C6: 1046.5, A3: 220, F3: 174.6, G3: 196, E3: 164.8, C3: 130.8, Eb4: 311.1, Gb4: 370, Bb3: 233.1 };

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.08) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
function seq(notes: [string, number][], step: number, type: OscillatorType = 'square', vol = 0.08) {
  let at = 0; for (const [n, len] of notes) { if (n !== '-') tone(NOTE[n]!, at, step * len * 0.95, type, vol); at += step * len; } return at;
}

export function setSoundEnabled(on: boolean) { enabled = on; if (!on) stopMenuMusic(); }

export function playWin() { if (!enabled) return; seq([['C5', 1], ['E5', 1], ['G5', 1], ['C6', 2], ['G5', 1], ['C6', 3]], 0.12); seq([['C4', 2], ['G4', 2], ['C5', 4]], 0.12, 'triangle', 0.1); }
export function playLose() { if (!enabled) return; seq([['G4', 1], ['Gb4', 1], ['F4', 1], ['E4', 4]], 0.22, 'sawtooth', 0.06); seq([['C3', 3], ['Bb3', 4]], 0.22, 'triangle', 0.1); }
export function playMilestone(big = false) {
  if (!enabled) return;
  if (big) { seq([['G4', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['G5', 3]], 0.1); seq([['C4', 3], ['E4', 3]], 0.1, 'triangle', 0.1); }
  else seq([['E5', 1], ['G5', 1], ['C6', 1], ['E5', 1], ['C6', 2]], 0.08, 'square', 0.07);
}
export function playCorrect() { if (!enabled) return; seq([['C5', 1], ['G5', 2]], 0.06, 'square', 0.05); }
export function playWrong() { if (!enabled) return; seq([['Eb4', 1], ['A3', 2]], 0.09, 'sawtooth', 0.05); }

const MELODY: [string, number][] = [['E5', 1], ['G5', 1], ['A5', 2], ['G5', 1], ['E5', 1], ['D5', 2], ['C5', 1], ['D5', 1], ['E5', 2], ['G4', 2], ['-', 2], ['A4', 1], ['C5', 1], ['D5', 2], ['E5', 1], ['D5', 1], ['C5', 2], ['A4', 2], ['G4', 2], ['-', 2]];
const BASS: [string, number][] = [['C3', 4], ['A3', 4], ['F3', 4], ['G3', 4], ['C3', 4], ['A3', 4], ['F3', 4], ['G3', 4]];
function loop() {
  if (!bgmOn || !enabled) return;
  const step = 0.2;
  const len = seq(MELODY, step, 'triangle', 0.035);
  seq(BASS, step, 'sine', 0.06);
  bgmTimer = setTimeout(loop, len * 1000);
}
export function startMenuMusic() { if (!enabled) return; ac(); if (bgmOn) return; bgmOn = true; loop(); }
export function stopMenuMusic() { bgmOn = false; clearTimeout(bgmTimer); }
