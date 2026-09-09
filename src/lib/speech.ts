import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { LANGUAGES, Lang } from '../data/languages';
import { useStore } from '../store/useStore';

/**
 * Sprachausgabe ueber die Stimmen des Betriebssystems.
 *
 * Nicht jedes Geraet hat fuer jede der acht Sprachen eine Stimme installiert.
 * Fehlt sie, bleibt es still - die Uebung selbst funktioniert weiter. Ist der
 * Ton in den Einstellungen ausgeschaltet (z. B. im Ruheraum), bleibt sie
 * ebenso still - dafuer duerfen Lektionen dann keine Hoeraufgaben enthalten,
 * siehe buildLesson() in exercises.ts.
 */
export function speak(text: string, lang: Lang) {
  if (!useStore.getState().soundEnabled) return;

  // Web Speech API ist im Browser zuverlässiger als der native Expo-Adapter.
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
    const synth = window.speechSynthesis;
    synth.cancel();
    synth.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    const language = LANGUAGES[lang].speech;
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voice = synth.getVoices().find((item) => item.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase()));
    if (voice) utterance.voice = voice;
    // Manche Browser laden Stimmen erst nach dem ersten Aufruf.
    window.setTimeout(() => synth.speak(utterance), 0);
    return;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Fallback für eingebettete Browser ohne verfügbare Sprachstimmen.
    try {
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextCtor) {
        const context = new AudioContextCtor();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 660;
        gain.gain.setValueAtTime(0.08, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.16);
      }
    } catch { /* Audio ist im Browser eventuell deaktiviert. */ }
    return;
  }
  Speech.stop();
  Speech.speak(text, {
    language: LANGUAGES[lang].speech,
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  Speech.stop();
}

/** Welche der acht Sprachen auf diesem Geraet tatsaechlich gesprochen werden. */
export async function availableLanguages(): Promise<Set<string>> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return new Set(voices.map((voice) => voice.language.slice(0, 2).toLowerCase()));
  } catch {
    return new Set();
  }
}
