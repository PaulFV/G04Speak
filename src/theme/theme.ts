/** Farb- und Abstandssystem der App. */
export const colors = {
  green: '#58CC02',
  greenDark: '#46A302',
  greenLight: '#D7FFB8',
  blue: '#1CB0F6',
  blueDark: '#1899D6',
  purple: '#CE82FF',
  orange: '#FF9600',
  gold: '#FFC800',
  red: '#FF4B4B',
  redDark: '#EA2B2B',
  redLight: '#FFDFE0',

  text: '#3C3C3C',
  textMuted: '#777777',
  textOnDark: '#FFFFFF',

  bg: '#FFFFFF',
  bgAlt: '#F7F7F7',
  border: '#E5E5E5',
  borderDark: '#D0D0D0',
  locked: '#E5E5E5',
  lockedText: '#AFAFAF',
} as const;

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
