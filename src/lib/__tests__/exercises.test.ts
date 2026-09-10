import { buildLesson, isAnswerCorrect, normalize, requeue, shuffle } from '../exercises';
import { ALL_LESSONS } from '../course';

describe('normalize / isAnswerCorrect (Vergleich freier Eingaben)', () => {
  it('ignoriert Gross-/Kleinschreibung', () => {
    expect(isAnswerCorrect('Hola', 'hola')).toBe(true);
  });

  it('ignoriert Satzzeichen', () => {
    expect(isAnswerCorrect('¿Qué tal?', 'Qué tal')).toBe(true);
  });

  it('ignoriert mehrfache/umgebende Leerzeichen', () => {
    expect(isAnswerCorrect('  guten   tag  ', 'guten tag')).toBe(true);
  });

  it('erkennt tatsaechlich falsche Antworten', () => {
    expect(isAnswerCorrect('gut', 'schlecht')).toBe(false);
  });

  it('normalize() kommt mit nicht-string-artigen Werten klar', () => {
    expect(normalize(undefined)).toBe('');
    expect(normalize(null)).toBe('');
  });
});

describe('shuffle', () => {
  it('behaelt alle Elemente, aendert nur die Reihenfolge', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort()).toEqual([...input].sort());
    // Original bleibt unveraendert (keine Mutation).
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('requeue', () => {
  it('verschiebt die Uebung ans Rundenende und markiert sie mit einem neuen key', () => {
    const list = [
      { key: 'a', kind: 'choose' } as any,
      { key: 'b', kind: 'choose' } as any,
      { key: 'c', kind: 'choose' } as any,
    ];
    const out = requeue(list, 1);
    expect(out.map((x) => x.key)).toEqual(['a', 'c', 'b-r']);
  });
});

describe('buildLesson', () => {
  const lesson = ALL_LESSONS[0];

  it('erzeugt fuer eine normale Lektion mindestens eine Uebung pro Begriff', () => {
    const exercises = buildLesson({ lesson, native: 'de', target: 'en', skillLevel: 'beginner' });
    expect(exercises.length).toBeGreaterThanOrEqual(lesson.termIds.length);
  });

  it('erzeugt keine Hoeraufgaben, wenn der Ton ausgeschaltet ist', () => {
    const exercises = buildLesson({ lesson, native: 'de', target: 'en', skillLevel: 'beginner', soundEnabled: false });
    expect(exercises.some((e) => e.kind === 'listen')).toBe(false);
  });

  it('liefert nichts, wenn Mutter- und Lernsprache identisch geschrieben sind', () => {
    // 'de' -> 'de' hiesse: jeder Begriff ist mit sich selbst identisch,
    // buildLesson() filtert solche Begriffe konsequent heraus.
    const exercises = buildLesson({ lesson, native: 'de', target: 'de', skillLevel: 'beginner' });
    expect(exercises).toEqual([]);
  });

  it('Anfaenger bekommen keine freien Eingaben (Typ "type") in normalen Lektionen', () => {
    const nonReview = ALL_LESSONS.find((l) => !l.isReview) ?? lesson;
    const exercises = buildLesson({ lesson: nonReview, native: 'de', target: 'en', skillLevel: 'beginner' });
    expect(exercises.some((e) => e.kind === 'type')).toBe(false);
  });
});
