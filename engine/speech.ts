let preferredVoice: SpeechSynthesisVoice | null = null;

function getVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }

  if (preferredVoice) {
    return preferredVoice;
  }

  const voices = window.speechSynthesis.getVoices();
  preferredVoice =
    voices.find((voice) => voice.lang.startsWith("en") && voice.localService) ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    voices[0] ??
    null;

  return preferredVoice;
}

export function speakText(
  text: string,
  enabled: boolean,
  rate = 0.95,
): void {
  if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  const voice = getVoice();
  if (voice) {
    utterance.voice = voice;
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function preloadVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = null;
    getVoice();
  };
}
