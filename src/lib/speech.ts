import * as Speech from 'expo-speech';

import { LANGUAGES, Lang } from '../data/languages';

/**
 * Sprachausgabe ueber die Stimmen des Betriebssystems.
 *
 * Nicht jedes Geraet hat fuer jede der acht Sprachen eine Stimme installiert.
 * Fehlt sie, bleibt es still - die Uebung selbst funktioniert weiter.
 */
export function speak(text: string, lang: Lang) {
  Speech.stop();
  Speech.speak(text, {
    language: LANGUAGES[lang].speech,
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking() {
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
