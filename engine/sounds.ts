let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.08,
): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

export function playAddCommand(enabled: boolean): void {
  if (!enabled) return;
  playTone(660, 0.08, "triangle");
}

export function playRemoveCommand(enabled: boolean): void {
  if (!enabled) return;
  playTone(440, 0.08, "triangle");
}

export function playMove(enabled: boolean): void {
  if (!enabled) return;
  playTone(520, 0.12, "sine");
}

export function playJump(enabled: boolean): void {
  if (!enabled) return;
  playTone(700, 0.08, "square");
  playTone(900, 0.1, "square", 0.05);
}

export function playMoo(enabled: boolean): void {
  if (!enabled) return;
  playTone(180, 0.25, "sawtooth", 0.06);
}

export function playSuccess(enabled: boolean): void {
  if (!enabled) return;
  playTone(523, 0.12, "triangle");
  setTimeout(() => playTone(659, 0.12, "triangle"), 120);
  setTimeout(() => playTone(784, 0.18, "triangle"), 240);
}

export function playRetry(enabled: boolean): void {
  if (!enabled) return;
  playTone(330, 0.18, "sine", 0.06);
}
