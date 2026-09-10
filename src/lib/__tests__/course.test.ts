import {
  ALL_LESSONS,
  COURSE,
  isUnlocked,
  lessonById,
  nextLesson,
  startOrderForSkillLevel,
} from '../course';

describe('COURSE / ALL_LESSONS Aufbau', () => {
  it('enthaelt mindestens eine Einheit mit mindestens einer Lektion', () => {
    expect(COURSE.length).toBeGreaterThan(0);
    expect(ALL_LESSONS.length).toBeGreaterThan(0);
  });

  it('vergibt fortlaufende, eindeutige order-Werte ueber den ganzen Pfad', () => {
    const orders = ALL_LESSONS.map((l) => l.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('schliesst jede Einheit mit einer Wiederholung ueber alle ihre Begriffe ab', () => {
    for (const { unit, lessons } of COURSE) {
      const review = lessons[lessons.length - 1];
      expect(review.isReview).toBe(true);
      expect(review.unitId).toBe(unit.id);

      const allTermsOfUnit = new Set(lessons.flatMap((l) => l.termIds));
      // Die Wiederholung deckt ausschliesslich Begriffe der eigenen Einheit ab.
      for (const termId of review.termIds) {
        expect(allTermsOfUnit.has(termId)).toBe(true);
      }
    }
  });

  it('lessonById findet vorhandene Lektionen und liefert sonst undefined', () => {
    expect(lessonById(ALL_LESSONS[0].id)).toEqual(ALL_LESSONS[0]);
    expect(lessonById('does-not-exist')).toBeUndefined();
  });
});

describe('nextLesson / isUnlocked', () => {
  it('ohne Fortschritt ist die erste Lektion die naechste und offen', () => {
    const first = ALL_LESSONS[0];
    expect(nextLesson({})).toEqual(first);
    expect(isUnlocked(first, {})).toBe(true);
  });

  it('eine Lektion ist erst offen, wenn die vorherige abgeschlossen ist', () => {
    const second = ALL_LESSONS[1];
    expect(isUnlocked(second, {})).toBe(false);
    expect(isUnlocked(second, { [ALL_LESSONS[0].id]: 1 })).toBe(true);
  });

  it('nextLesson ueberspringt bereits abgeschlossene Lektionen', () => {
    const completed = { [ALL_LESSONS[0].id]: 1, [ALL_LESSONS[1].id]: 1 };
    expect(nextLesson(completed)).toEqual(ALL_LESSONS[2]);
  });

  it('startOrder gibt fortgeschrittenen Lernenden einen spaeteren Einstiegspunkt', () => {
    const startOrder = startOrderForSkillLevel('pro');
    expect(startOrder).toBeGreaterThan(0);
    const atStart = ALL_LESSONS[startOrder];
    expect(isUnlocked(atStart, {}, startOrder)).toBe(true);
  });
});

describe('startOrderForSkillLevel', () => {
  it('ist 0 fuer Anfaenger und unbekannte/fehlende Level', () => {
    expect(startOrderForSkillLevel('beginner')).toBe(0);
    expect(startOrderForSkillLevel(null)).toBe(0);
    expect(startOrderForSkillLevel(undefined)).toBe(0);
  });

  it('waechst monoton mit dem Lernlevel', () => {
    const advanced = startOrderForSkillLevel('advanced');
    const pro = startOrderForSkillLevel('pro');
    const teacher = startOrderForSkillLevel('teacher');
    expect(advanced).toBeLessThan(pro);
    expect(pro).toBeLessThan(teacher);
    expect(teacher).toBeLessThan(ALL_LESSONS.length);
  });
});
