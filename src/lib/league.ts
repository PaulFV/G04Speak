/**
 * Wochenliga.
 *
 * Ohne Server gibt es keine echten Mitspieler, deshalb erzeugt die App eine
 * feste Gruppe von Gegnern. Die Werte haengen an der laufenden Kalenderwoche
 * und bleiben dadurch die ganze Woche ueber stabil.
 */

export const LEAGUES = [
  { id: 'bronze', name: 'Bronze', color: '#CD7F32' },
  { id: 'silver', name: 'Silber', color: '#9CA3AF' },
  { id: 'gold', name: 'Gold', color: '#FFC800' },
  { id: 'sapphire', name: 'Saphir', color: '#1CB0F6' },
  { id: 'ruby', name: 'Rubin', color: '#FF4B4B' },
] as const;

export interface LeagueEntry {
  id: string;
  name: string;
  xp: number;
  isUser: boolean;
}

const BOT_NAMES = [
  'Mira', 'Tomasz', 'Elif', 'Andrei', 'Nadia', 'Bence', 'Lucas', 'Katarzyna',
  'Dario', 'Zsofia', 'Ivan', 'Aylin', 'Petra', 'Radu',
];

/** Kalenderwoche als stabiler Startwert fuer die Zufallszahlen. */
export function weekSeed(date = new Date()): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return date.getUTCFullYear() * 100 + Math.floor(days / 7);
}

/** Deterministischer Pseudozufall, damit die Liga nicht bei jedem Rendern springt. */
function seeded(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function leagueForLevel(level: number) {
  return LEAGUES[Math.min(LEAGUES.length - 1, Math.floor((level - 1) / 3))];
}

export function buildLeaderboard(userXp: number, userName: string, seed = weekSeed()): LeagueEntry[] {
  const random = seeded(seed);
  // Die Gegner streuen um den eigenen Wochenwert, damit die Liga erreichbar bleibt.
  const midpoint = Math.max(60, userXp);

  const bots: LeagueEntry[] = BOT_NAMES.map((name, i) => ({
    id: `bot-${i}`,
    name,
    xp: Math.round(midpoint * (0.25 + random() * 1.8)),
    isUser: false,
  }));

  return [...bots, { id: 'user', name: userName, xp: userXp, isUser: true }]
    .sort((a, b) => b.xp - a.xp);
}
