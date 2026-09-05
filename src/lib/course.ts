import { Lang } from '../data/languages';
import { TERMS_PER_LESSON, Term, UNITS, UnitInfo, termsOfUnit } from '../data/vocabulary';

/**
 * Baut aus den Einheiten den linearen Lernpfad auf - eine Lektion pro
 * Knoten, wie im heutigen Duolingo (kein verzweigter Skill-Tree mehr).
 */

export interface Lesson {
  id: string;
  unitId: string;
  /** Position innerhalb der Einheit, ab 1 */
  index: number;
  /** Fortlaufende Position im gesamten Pfad, ab 0 */
  order: number;
  termIds: string[];
  /** Jede vierte Lektion ist eine Wiederholung ueber die ganze Einheit. */
  isReview: boolean;
}

export interface UnitPlan {
  unit: UnitInfo;
  lessons: Lesson[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Der komplette Lernpfad. Er ist fuer alle Sprachpaare identisch. */
export const COURSE: UnitPlan[] = (() => {
  let order = 0;
  return UNITS.map((unit) => {
    const terms = termsOfUnit(unit.id);
    const groups = chunk(terms, TERMS_PER_LESSON);
    const lessons: Lesson[] = groups.map((group, i) => ({
      id: `${unit.id}-${i + 1}`,
      unitId: unit.id,
      index: i + 1,
      order: order++,
      termIds: group.map((t) => t.id),
      isReview: false,
    }));

    // Abschluss jeder Einheit: eine Wiederholung ueber alle ihre Begriffe.
    lessons.push({
      id: `${unit.id}-review`,
      unitId: unit.id,
      index: lessons.length + 1,
      order: order++,
      termIds: terms.map((t) => t.id),
      isReview: true,
    });

    return { unit, lessons };
  });
})();

export const ALL_LESSONS: Lesson[] = COURSE.flatMap((u) => u.lessons);

export function lessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function unitById(id: string): UnitInfo | undefined {
  return UNITS.find((u) => u.id === id);
}

/** Die erste noch nicht abgeschlossene Lektion. */
export function nextLesson(completed: Record<string, number>): Lesson | undefined {
  return ALL_LESSONS.find((l) => !completed[l.id]);
}

/** Eine Lektion ist offen, wenn alle vorherigen erledigt sind. */
export function isUnlocked(lesson: Lesson, completed: Record<string, number>): boolean {
  if (lesson.order === 0) return true;
  const previous = ALL_LESSONS[lesson.order - 1];
  return Boolean(completed[previous.id]);
}

export function courseTitle(unit: UnitInfo, lang: Lang): string {
  return unit.title[lang];
}

export function termsForLesson(lesson: Lesson, all: Term[]): Term[] {
  const set = new Set(lesson.termIds);
  return all.filter((t) => set.has(t.id));
}
