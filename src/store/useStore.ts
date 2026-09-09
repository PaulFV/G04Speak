import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Lang } from '../data/languages';
import { startOrderForSkillLevel } from '../lib/course';
import { TermStat, advance, isLearned } from '../lib/srs';

export const MAX_HEARTS = 5;
/** Ein Herz erholt sich alle 30 Minuten von selbst. */
export const HEART_REGEN_MS = 30 * 60 * 1000;
export const REFILL_COST = 50;
export const XP_PER_LESSON = 10;
export const XP_PERFECT_BONUS = 5;

export type DailyGoal = 10 | 20 | 30 | 50;
export type ThemeMode = 'light' | 'dark';
export type SkillLevel = 'beginner' | 'advanced' | 'pro' | 'teacher';

/**
 * Kalendertag in der lokalen Zeitzone des Geraets (nicht UTC) - sonst kann
 * die Tagesserie fuer Nutzer westlich/oestlich von UTC um Mitternacht falsch
 * kippen.
 */
function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

/** Fortschritt eines einzelnen Sprachpaars (Muttersprache -> Lernsprache). */
export interface CourseProgress {
  completed: Record<string, number>;
  stats: Record<string, TermStat>;
  /** Einstiegspunkt im Lernpfad, festgelegt beim ersten Start dieses Sprachpaars. */
  startOrder: number;
}

function courseKey(native: Lang, target: Lang): string {
  return `${native}-${target}`;
}

/** Level 1 bei 0 XP, danach jeweils 100 XP pro Stufe. */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % 100;
}

export interface LessonResult {
  lessonId: string;
  correct: number;
  total: number;
  answers: { termId: string; correct: boolean }[];
}

interface State {
  hydrated: boolean;

  native: Lang | null;
  target: Lang | null;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  skillLevel: SkillLevel | null;

  xp: number;
  gems: number;
  hearts: number;
  heartsUpdatedAt: number;

  streak: number;
  lastActiveDay: string | null;

  dailyGoal: DailyGoal;
  xpToday: number;
  xpTodayDay: string;
  weeklyXp: number;
  lastBonusDay: string | null;

  completed: Record<string, number>;
  stats: Record<string, TermStat>;
  /** Einstiegspunkt im Lernpfad des aktuell aktiven Sprachpaars. */
  courseStartOrder: number;
  /** Fortschritt je Sprachpaar, damit ein Sprachwechsel nicht ueberschreibt. */
  progressByCourse: Record<string, CourseProgress>;
  unlockedAchievements: string[];

  setCourse: (native: Lang, target: Lang) => void;
  setNativeLanguage: (native: Lang) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setSoundEnabled: (soundEnabled: boolean) => void;
  setSkillLevel: (skillLevel: SkillLevel) => void;
  setDailyGoal: (goal: DailyGoal) => void;
  regenerateHearts: () => void;
  loseHeart: () => void;
  refillHearts: () => boolean;
  claimDailyBonus: () => boolean;
  finishLesson: (result: LessonResult) => { xpGained: number; leveledUp: boolean };
  unlockAchievement: (id: string) => void;
  learnedCount: () => number;
  reset: () => void;
}

const initial = {
  hydrated: false,
  native: null as Lang | null,
  target: null as Lang | null,
  // Bisheriges Erscheinungsbild der App als Standard - "hell" gibt es erst
  // seit der echten Umsetzung des Umschalters unten.
  themeMode: 'dark' as ThemeMode,
  soundEnabled: true,
  skillLevel: null as SkillLevel | null,
  xp: 0,
  gems: 100,
  hearts: MAX_HEARTS,
  heartsUpdatedAt: Date.now(),
  streak: 0,
  lastActiveDay: null as string | null,
  dailyGoal: 20 as DailyGoal,
  xpToday: 0,
  xpTodayDay: dayKey(),
  weeklyXp: 0,
  lastBonusDay: null as string | null,
  completed: {} as Record<string, number>,
  stats: {} as Record<string, TermStat>,
  courseStartOrder: 0,
  progressByCourse: {} as Record<string, CourseProgress>,
  unlockedAchievements: [] as string[],
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      // Muttersprache und Lernsprache muessen sich unterscheiden - sonst
      // stuenden in jeder Uebung auf beiden Seiten dieselben Woerter.
      //
      // Jedes Sprachpaar behaelt seinen eigenen Fortschritt: Beim Verlassen
      // eines Kurses wird er in progressByCourse abgelegt, beim (Wieder-)
      // Betreten eines Kurses wieder geladen. Ein noch nie gelernter Kurs
      // startet - je nach gewaehltem Lernlevel - nicht zwingend bei Lektion 1
      // (siehe startOrderForSkillLevel).
      setCourse: (native, target) => {
        if (native === target) return;
        const state = get();

        const progressByCourse = { ...state.progressByCourse };
        if (state.native && state.target) {
          progressByCourse[courseKey(state.native, state.target)] = {
            completed: state.completed,
            stats: state.stats,
            startOrder: state.courseStartOrder,
          };
        }

        const key = courseKey(native, target);
        const existing = progressByCourse[key];
        const courseProgress: CourseProgress = existing ?? {
          completed: {},
          stats: {},
          startOrder: startOrderForSkillLevel(state.skillLevel),
        };
        progressByCourse[key] = courseProgress;

        set({
          native,
          target,
          progressByCourse,
          completed: courseProgress.completed,
          stats: courseProgress.stats,
          courseStartOrder: courseProgress.startOrder,
        });
      },
      setNativeLanguage: (native) => {
        const { target } = get();
        if (target && target !== native) {
          // Sprachpaar aendert sich (andere Muttersprache, gleiche Lernsprache)
          // - ueber setCourse laufen lassen, damit der Fortschritt je Paar
          // erhalten bleibt.
          get().setCourse(native, target);
          return;
        }
        set({ native, target: null, completed: {}, stats: {}, courseStartOrder: 0 });
      },

      setThemeMode: (themeMode) => set({ themeMode }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSkillLevel: (skillLevel) => set({ skillLevel }),

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),

      regenerateHearts: () => {
        const { hearts, heartsUpdatedAt } = get();
        // Nichts zu tun (und nichts zu speichern), solange die Herzen voll
        // sind - loseHeart() setzt heartsUpdatedAt selbst neu, sobald ein
        // Herz aus vollem Bestand verloren geht.
        if (hearts >= MAX_HEARTS) return;
        const elapsed = Date.now() - heartsUpdatedAt;
        const recovered = Math.floor(elapsed / HEART_REGEN_MS);
        if (recovered <= 0) return;

        const next = Math.min(MAX_HEARTS, hearts + recovered);
        set({
          hearts: next,
          heartsUpdatedAt: next >= MAX_HEARTS ? Date.now() : heartsUpdatedAt + recovered * HEART_REGEN_MS,
        });
      },

      loseHeart: () => {
        const { hearts, heartsUpdatedAt } = get();
        set({
          hearts: Math.max(0, hearts - 1),
          heartsUpdatedAt: hearts === MAX_HEARTS ? Date.now() : heartsUpdatedAt,
        });
      },

      refillHearts: () => {
        const { gems } = get();
        if (gems < REFILL_COST) return false;
        set({ gems: gems - REFILL_COST, hearts: MAX_HEARTS, heartsUpdatedAt: Date.now() });
        return true;
      },

      claimDailyBonus: () => {
        const state = get();
        const today = dayKey();
        if (state.lastBonusDay === today) return false;
        set({ gems: state.gems + 50, hearts: MAX_HEARTS, heartsUpdatedAt: Date.now(), lastBonusDay: today });
        return true;
      },

      finishLesson: (result) => {
        const state = get();
        const today = dayKey();

        // Tagesserie fortschreiben.
        let streak = state.streak;
        if (state.lastActiveDay !== today) {
          const gap = state.lastActiveDay ? daysBetween(state.lastActiveDay, today) : Infinity;
          streak = gap === 1 ? state.streak + 1 : 1;
        }

        const perfect = result.correct === result.total;
        const repeat = state.completed[result.lessonId] ?? 0;
        // Wiederholte Lektionen geben weniger XP.
        const base = repeat > 0 ? Math.ceil(XP_PER_LESSON / 2) : XP_PER_LESSON;
        const xpGained = base + (perfect ? XP_PERFECT_BONUS : 0);

        const stats = { ...state.stats };
        for (const answer of result.answers) {
          stats[answer.termId] = advance(stats[answer.termId], answer.correct);
        }

        const sameDay = state.xpTodayDay === today;
        const xp = state.xp + xpGained;

        set({
          xp,
          gems: state.gems + (perfect ? 5 : 2),
          streak,
          lastActiveDay: today,
          xpToday: (sameDay ? state.xpToday : 0) + xpGained,
          xpTodayDay: today,
          weeklyXp: state.weeklyXp + xpGained,
          completed: { ...state.completed, [result.lessonId]: repeat + 1 },
          stats,
        });

        return { xpGained, leveledUp: levelFromXp(xp) > levelFromXp(state.xp) };
      },

      unlockAchievement: (id) => {
        const { unlockedAchievements } = get();
        if (unlockedAchievements.includes(id)) return;
        set({ unlockedAchievements: [...unlockedAchievements, id] });
      },

      learnedCount: () => Object.values(get().stats).filter(isLearned).length,

      reset: () => set({ ...initial, hydrated: true, heartsUpdatedAt: Date.now(), xpTodayDay: dayKey() }),
    }),
    {
      name: 'gospeak-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        state?.regenerateHearts();
        useStore.setState({ hydrated: true });
      },
    },
  ),
);
