export const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
  B5: 987.77,
};

export const WHITE_KEYS = [
  { note: 'C4', label: 'C' },
  { note: 'D4', label: 'D' },
  { note: 'E4', label: 'E' },
  { note: 'F4', label: 'F' },
  { note: 'G4', label: 'G' },
  { note: 'A4', label: 'A' },
  { note: 'B4', label: 'B' },
  { note: 'C5', label: 'C' },
  { note: 'D5', label: 'D' },
  { note: 'E5', label: 'E' },
  { note: 'F5', label: 'F' },
  { note: 'G5', label: 'G' },
  { note: 'A5', label: 'A' },
  { note: 'B5', label: 'B' },
];

let audioCtx: AudioContext | null = null;

export function playNote(note: string) {
  try {
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Sine wave synthesizer sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Gain envelope to make it sound like a soft organ/piano strike
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.03); // rapid attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8); // decay

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (err) {
    console.error('Web Audio API note error:', err);
  }
}
