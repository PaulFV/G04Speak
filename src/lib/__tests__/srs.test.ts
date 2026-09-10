import { MAX_LEVEL, advance, dueTermIds, emptyStat, isLearned } from '../srs';

const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [0, 1, 3, 7, 16, 35];

describe('srs (Leitner-Wiederholung)', () => {
  it('emptyStat startet bei Stufe 0 ohne Versuche', () => {
    expect(emptyStat()).toEqual({ level: 0, due: 0, correct: 0, wrong: 0 });
  });

  it('steigt bei richtiger Antwort eine Stufe und setzt das passende Intervall', () => {
    const now = 1_000_000;
    const next = advance(undefined, true, now);
    expect(next.level).toBe(1);
    expect(next.due).toBe(now + INTERVALS[1] * DAY);
    expect(next.correct).toBe(1);
    expect(next.wrong).toBe(0);
  });

  it('faellt bei falscher Antwort eine Stufe zurueck, nie unter 0', () => {
    const atZero = advance(emptyStat(), false, 0);
    expect(atZero.level).toBe(0);
    expect(atZero.wrong).toBe(1);

    const atOne = advance({ level: 1, due: 0, correct: 1, wrong: 0 }, false, 0);
    expect(atOne.level).toBe(0);
  });

  it('steigt nie ueber MAX_LEVEL', () => {
    let stat = emptyStat();
    for (let i = 0; i < 10; i++) stat = advance(stat, true, 0);
    expect(stat.level).toBe(MAX_LEVEL);
    expect(stat.level).toBeLessThanOrEqual(INTERVALS.length - 1);
  });

  it('isLearned gilt erst ab Stufe 3', () => {
    expect(isLearned(undefined)).toBe(false);
    expect(isLearned({ level: 2, due: 0, correct: 2, wrong: 0 })).toBe(false);
    expect(isLearned({ level: 3, due: 0, correct: 3, wrong: 0 })).toBe(true);
  });

  it('dueTermIds liefert nur faellige, gelernte Begriffe, aelteste zuerst', () => {
    const now = 10_000;
    const stats = {
      neverStudied: { level: 0, due: 0, correct: 0, wrong: 0 }, // level 0 -> zaehlt nicht
      notYetDue: { level: 1, due: now + DAY, correct: 1, wrong: 0 },
      dueLater: { level: 2, due: now - 100, correct: 2, wrong: 0 },
      dueEarlier: { level: 1, due: now - 5000, correct: 1, wrong: 0 },
    };
    expect(dueTermIds(stats, 10, now)).toEqual(['dueEarlier', 'dueLater']);
  });

  it('dueTermIds respektiert das uebergebene Limit', () => {
    const now = 10_000;
    const stats = {
      a: { level: 1, due: now - 1, correct: 1, wrong: 0 },
      b: { level: 1, due: now - 2, correct: 1, wrong: 0 },
      c: { level: 1, due: now - 3, correct: 1, wrong: 0 },
    };
    expect(dueTermIds(stats, 2, now)).toHaveLength(2);
  });
});
