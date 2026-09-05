/**
 * Verteiltes Wiederholen (Leitner-System).
 *
 * Jeder Begriff wandert bei einer richtigen Antwort eine Stufe hoch und faellt
 * bei einer falschen wieder zurueck. Je hoeher die Stufe, desto laenger der
 * Abstand bis zur naechsten Wiederholung.
 */

export interface TermStat {
  level: number;
  /** Zeitpunkt der naechsten Faelligkeit (ms seit Epoche) */
  due: number;
  correct: number;
  wrong: number;
}

const DAY = 24 * 60 * 60 * 1000;

/** Abstand in Tagen je Stufe. */
const INTERVALS = [0, 1, 3, 7, 16, 35];

export const MAX_LEVEL = INTERVALS.length - 1;

export function emptyStat(): TermStat {
  return { level: 0, due: 0, correct: 0, wrong: 0 };
}

export function advance(stat: TermStat | undefined, wasCorrect: boolean, now = Date.now()): TermStat {
  const current = stat ?? emptyStat();
  const level = wasCorrect
    ? Math.min(current.level + 1, MAX_LEVEL)
    : Math.max(current.level - 1, 0);

  return {
    level,
    due: now + INTERVALS[level] * DAY,
    correct: current.correct + (wasCorrect ? 1 : 0),
    wrong: current.wrong + (wasCorrect ? 0 : 1),
  };
}

/** Begriffe, deren Wiederholung faellig ist - die aeltesten zuerst. */
export function dueTermIds(stats: Record<string, TermStat>, limit: number, now = Date.now()): string[] {
  return Object.entries(stats)
    .filter(([, stat]) => stat.due <= now && stat.level > 0)
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, limit)
    .map(([id]) => id);
}

/** Ein Begriff gilt als gelernt, sobald er Stufe 3 erreicht hat. */
export function isLearned(stat: TermStat | undefined): boolean {
  return (stat?.level ?? 0) >= 3;
}
