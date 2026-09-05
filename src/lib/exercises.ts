import { Lang } from '../data/languages';
import { TERMS, Term, termById } from '../data/vocabulary';
import { Lesson } from './course';

/**
 * Erzeugt die Uebungen einer Lektion.
 *
 * Weil jeder Begriff Uebersetzungen in allen acht Sprachen traegt, entstehen
 * die Aufgaben fuer jedes Sprachpaar aus demselben Datensatz.
 */

export type ExerciseKind = 'choose' | 'listen' | 'build' | 'type' | 'match';

interface Base {
  key: string;
  kind: ExerciseKind;
}

export interface ChooseExercise extends Base {
  kind: 'choose';
  termId: string;
  prompt: string;
  promptLang: Lang;
  answer: string;
  answerLang: Lang;
  options: string[];
}

export interface ListenExercise extends Base {
  kind: 'listen';
  termId: string;
  answer: string;
  answerLang: Lang;
  options: string[];
}

export interface BuildExercise extends Base {
  kind: 'build';
  termId: string;
  prompt: string;
  promptLang: Lang;
  answer: string;
  answerLang: Lang;
  tokens: string[];
}

export interface TypeExercise extends Base {
  kind: 'type';
  termId: string;
  prompt: string;
  promptLang: Lang;
  answer: string;
  answerLang: Lang;
}

export interface MatchPair {
  termId: string;
  left: string;
  right: string;
}

export interface MatchExercise extends Base {
  kind: 'match';
  pairs: MatchPair[];
  leftLang: Lang;
  rightLang: Lang;
}

export type Exercise =
  | ChooseExercise
  | ListenExercise
  | BuildExercise
  | TypeExercise
  | MatchExercise;

export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Falsche Antwortmoeglichkeiten. Begriffe aus derselben Einheit sind
 * schwieriger und deshalb bevorzugt; identische Wortlaute fallen raus,
 * damit nie zwei richtige Optionen nebeneinander stehen.
 */
function distractors(term: Term, lang: Lang, count: number): string[] {
  const correct = term[lang];
  const sameUnit = TERMS.filter((t) => t.unit === term.unit && t[lang] !== correct);
  const others = TERMS.filter((t) => t.unit !== term.unit && t.kind === term.kind && t[lang] !== correct);

  const pool = [...shuffle(sameUnit), ...shuffle(others)];
  const out: string[] = [];
  for (const candidate of pool) {
    const value = candidate[lang];
    if (value === correct || out.includes(value)) continue;
    out.push(value);
    if (out.length === count) break;
  }
  return out;
}

/** Zerlegt einen Satz in Wort-Kacheln und mischt Fuellwoerter dazu. */
function buildTokens(term: Term, lang: Lang): string[] {
  const words = term[lang].split(/\s+/).filter(Boolean);
  const extraPool = TERMS.filter((t) => t.unit === term.unit && t.id !== term.id)
    .flatMap((t) => t[lang].split(/\s+/))
    .filter((word) => word.length > 1 && !words.includes(word));

  const extras = shuffle([...new Set(extraPool)]).slice(0, Math.min(3, Math.max(2, 6 - words.length)));
  return shuffle([...words, ...extras]);
}

function chooseEx(term: Term, from: Lang, to: Lang, key: string): ChooseExercise {
  return {
    key,
    kind: 'choose',
    termId: term.id,
    prompt: term[from],
    promptLang: from,
    answer: term[to],
    answerLang: to,
    options: shuffle([term[to], ...distractors(term, to, 3)]),
  };
}

function listenEx(term: Term, target: Lang, key: string): ListenExercise {
  return {
    key,
    kind: 'listen',
    termId: term.id,
    answer: term[target],
    answerLang: target,
    options: shuffle([term[target], ...distractors(term, target, 3)]),
  };
}

function buildEx(term: Term, native: Lang, target: Lang, key: string): BuildExercise {
  return {
    key,
    kind: 'build',
    termId: term.id,
    prompt: term[native],
    promptLang: native,
    answer: term[target],
    answerLang: target,
    tokens: buildTokens(term, target),
  };
}

function typeEx(term: Term, native: Lang, target: Lang, key: string): TypeExercise {
  return {
    key,
    kind: 'type',
    termId: term.id,
    prompt: term[native],
    promptLang: native,
    answer: term[target],
    answerLang: target,
  };
}

function matchEx(terms: Term[], native: Lang, target: Lang, key: string): MatchExercise {
  return {
    key,
    kind: 'match',
    leftLang: native,
    rightLang: target,
    pairs: terms.slice(0, 4).map((t) => ({ termId: t.id, left: t[native], right: t[target] })),
  };
}

export interface BuildLessonOptions {
  lesson: Lesson;
  native: Lang;
  target: Lang;
  /** Faellige Begriffe aus frueheren Lektionen, die mit eingestreut werden. */
  reviewTermIds?: string[];
}

/**
 * Setzt eine Lektion zusammen: ein Zuordnungsspiel zum Aufwaermen, danach
 * gemischte Aufgabentypen, am Ende die schwereren Frei-Eingaben.
 */
export function buildLesson({ lesson, native, target, reviewTermIds = [] }: BuildLessonOptions): Exercise[] {
  const lessonTerms = lesson.termIds
    .map(termById)
    .filter((t): t is Term => Boolean(t));

  if (lessonTerms.length === 0) return [];

  const reviewTerms = reviewTermIds
    .map(termById)
    .filter((t): t is Term => Boolean(t) && !lesson.termIds.includes(t.id))
    .slice(0, 3);

  const exercises: Exercise[] = [];
  let n = 0;
  const nextKey = () => `${lesson.id}-${n++}`;

  const words = lessonTerms.filter((t) => t.kind === 'word');
  if (words.length >= 4) {
    exercises.push(matchEx(shuffle(words), native, target, nextKey()));
  }

  // Jeder Begriff der Lektion kommt in beide Richtungen dran.
  for (const term of shuffle(lessonTerms)) {
    exercises.push(chooseEx(term, native, target, nextKey()));

    if (term.kind === 'phrase') {
      exercises.push(buildEx(term, native, target, nextKey()));
    } else if (Math.random() < 0.5) {
      exercises.push(listenEx(term, target, nextKey()));
    } else {
      exercises.push(chooseEx(term, target, native, nextKey()));
    }
  }

  // Wiederholungen aus dem Langzeitgedaechtnis.
  for (const term of reviewTerms) {
    exercises.push(pick([
      () => chooseEx(term, target, native, nextKey()),
      () => listenEx(term, target, nextKey()),
    ])());
  }

  // Zum Schluss zwei freie Eingaben - der schwerste Aufgabentyp.
  for (const term of shuffle(lessonTerms).slice(0, 2)) {
    exercises.push(typeEx(term, native, target, nextKey()));
  }

  return exercises;
}

/**
 * Vergleich fuer freie Eingaben: Gross-/Kleinschreibung, Satzzeichen und
 * doppelte Leerzeichen werden ignoriert, damit Tippfehler nicht unfair sind.
 */
export function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[.,!?;:¿¡"'()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAnswerCorrect(given: string, expected: string): boolean {
  return normalize(given) === normalize(expected);
}

/** Die Uebung, die der Nutzer wiederholen muss, wandert ans Ende der Runde. */
export function requeue(list: Exercise[], index: number): Exercise[] {
  const item = list[index];
  return [...list.slice(0, index), ...list.slice(index + 1), { ...item, key: `${item.key}-r` }];
}
