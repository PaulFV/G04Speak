/** Farb- und Abstandssystem der App. */
export const colors = {
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

/** Dunkle Palette für kontrastreiches Lernen bei wenig Umgebungslicht. */
export const darkColors = {
  ...colors,
  text: '#F7F7FF',
  textMuted: '#B8B5D0',
  bg: '#111229',
  bgAlt: '#1C1D3A',
  border: '#37385C',
  borderDark: '#50517A',
  locked: '#292A49',
  lockedText: '#8886A8',
  greenLight: '#173B27',
  redLight: '#4A2028',
} as const;

export type ThemeColors = { [K in keyof typeof colors]: string };
export type ThemeMode = 'light' | 'dark';
export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : colors;
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
