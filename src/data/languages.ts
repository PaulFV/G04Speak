/**
 * Die acht von G04Speak unterstuetzten Sprachen.
 *
 * Jeder Vokabeleintrag traegt eine Uebersetzung fuer jede dieser Sprachen.
 * Dadurch entsteht aus einem einzigen Datensatz jede beliebige Kombination
 * aus Muttersprache und Lernsprache: 8 x 7 = 56 Kurse.
 */

export const LANG_CODES = ['de', 'en', 'es', 'ro', 'ru', 'tr', 'hu', 'pl'] as const;

export type Lang = (typeof LANG_CODES)[number];

export interface LanguageInfo {
  code: Lang;
  /** Eigenbezeichnung der Sprache */
  name: string;
  flag: string;
  /** BCP-47 Tag fuer die Sprachausgabe (expo-speech) */
  speech: string;
  color: string;
}

export const LANGUAGES: Record<Lang, LanguageInfo> = {
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪', speech: 'de-DE', color: '#1F2937' },
  en: { code: 'en', name: 'English', flag: '🇬🇧', speech: 'en-US', color: '#1D4ED8' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸', speech: 'es-ES', color: '#D97706' },
  ro: { code: 'ro', name: 'Română', flag: '🇷🇴', speech: 'ro-RO', color: '#1E40AF' },
  ru: { code: 'ru', name: 'Русский', flag: '🇷🇺', speech: 'ru-RU', color: '#B91C1C' },
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷', speech: 'tr-TR', color: '#DC2626' },
  hu: { code: 'hu', name: 'Magyar', flag: '🇭🇺', speech: 'hu-HU', color: '#047857' },
  pl: { code: 'pl', name: 'Polski', flag: '🇵🇱', speech: 'pl-PL', color: '#BE123C' },
};

export const LANGUAGE_LIST: LanguageInfo[] = LANG_CODES.map((c) => LANGUAGES[c]);

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANG_CODES as readonly string[]).includes(value);
}
