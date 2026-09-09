import { useStore } from '../store/useStore';

/**
 * Farb- und Abstandssystem der App.
 *
 * Es gibt zwei Paletten: `darkColors` ist das bisherige, dunkle
 * Erscheinungsbild (weiterhin die Vorgabe fuer bestehende Installationen),
 * `lightColors` eine echte helle Variante fuer den Umschalter im Profil.
 * Komponenten sollten nicht direkt importieren, sondern den Hook
 * `useThemeColors()` unten verwenden, damit der Umschalter tatsaechlich
 * etwas bewirkt.
 */
export const darkColors = {
  green: '#42D95A',
  greenDark: '#21A83B',
  greenLight: '#D9FFE1',
  blue: '#15B8FF',
  blueDark: '#087EC4',
  purple: '#8B5CF6',
  orange: '#FF9600',
  gold: '#FFC800',
  red: '#FF4B4B',
  redDark: '#EA2B2B',
  redLight: '#FFDFE0',

  text: '#F6F7FF',
  textMuted: '#A8B1D1',
  textOnDark: '#FFFFFF',

  bg: '#0B1020',
  bgAlt: '#171D33',
  border: '#2D3654',
  borderDark: '#465175',
  locked: '#252C46',
  lockedText: '#7C86A7',
} as const;

/** Helle Palette - dieselben Akzentfarben, aber ein heller Hintergrund und dunkler Text. */
export const lightColors = {
  ...darkColors,
  greenLight: '#EAFBEE',
  redLight: '#FFF1F1',

  text: '#111827',
  textMuted: '#6B7280',

  bg: '#FFFFFF',
  bgAlt: '#F4F5F9',
  border: '#E3E5EF',
  borderDark: '#CBD0E0',
  locked: '#EEF0F6',
  lockedText: '#9AA1B8',
} as const;

export type ThemeColors = { [K in keyof typeof darkColors]: string };
export type ThemeMode = 'light' | 'dark';
export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

/** Liefert die Farben passend zum im Store gewaehlten Modus. Reaktiv: aendert sich der Modus, rendert die Komponente neu. */
export function useThemeColors(): ThemeColors {
  const mode = useStore((s) => s.themeMode);
  return getColors(mode);
}

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const font = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '800' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '600' as const },
};

/** Der 3D-Effekt der Duolingo-Buttons: farbige Kante unter dem Button. */
export function raised(base: string, edge: string) {
  return {
    backgroundColor: base,
    borderBottomWidth: 4,
    borderBottomColor: edge,
  };
}
