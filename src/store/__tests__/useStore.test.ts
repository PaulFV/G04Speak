import {
  HEART_REGEN_MS,
  MAX_HEARTS,
  REFILL_COST,
  XP_PERFECT_BONUS,
  XP_PER_LESSON,
  courseKey,
  isProgressBackup,
  levelFromXp,
  restoreProgress,
  serializeProgress,
  useStore,
  xpIntoLevel,
} from '../useStore';

describe('levelFromXp / xpIntoLevel', () => {
  it('Level 1 bei 0 XP, dann alle 100 XP eine Stufe', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(250)).toBe(3);
  });

  it('xpIntoLevel ist der Rest innerhalb der aktuellen Stufe', () => {
    expect(xpIntoLevel(0)).toBe(0);
    expect(xpIntoLevel(150)).toBe(50);
  });
});

describe('courseKey', () => {
  it('kombiniert Mutter- und Lernsprache eindeutig', () => {
    expect(courseKey('de', 'en')).toBe('de-en');
    expect(courseKey('en', 'de')).not.toBe(courseKey('de', 'en'));
  });
});

describe('useStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    useStore.getState().reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('startet mit vollen Herzen und den erwarteten Startwerten', () => {
    const s = useStore.getState();
    expect(s.hearts).toBe(MAX_HEARTS);
    expect(s.xp).toBe(0);
    expect(s.streak).toBe(0);
  });

  it('loseHeart verringert die Herzen und merkt sich den Zeitpunkt', () => {
    useStore.getState().loseHeart();
    expect(useStore.getState().hearts).toBe(MAX_HEARTS - 1);
  });

  it('regenerateHearts stellt nach der Regenerationszeit ein Herz wieder her', () => {
    useStore.getState().loseHeart();
    jest.setSystemTime(new Date(Date.now() + HEART_REGEN_MS + 1000));
    useStore.getState().regenerateHearts();
    expect(useStore.getState().hearts).toBe(MAX_HEARTS);
  });

  it('regenerateHearts tut nichts, solange die Regenerationszeit nicht um ist', () => {
    useStore.getState().loseHeart();
    jest.setSystemTime(new Date(Date.now() + HEART_REGEN_MS / 2));
    useStore.getState().regenerateHearts();
    expect(useStore.getState().hearts).toBe(MAX_HEARTS - 1);
  });

  it('refillHearts scheitert ohne genug Edelsteine und gelingt mit genug', () => {
    useStore.setState({ gems: REFILL_COST - 1, hearts: 1 });
    expect(useStore.getState().refillHearts()).toBe(false);

    useStore.setState({ gems: REFILL_COST });
    expect(useStore.getState().refillHearts()).toBe(true);
    expect(useStore.getState().hearts).toBe(MAX_HEARTS);
    expect(useStore.getState().gems).toBe(0);
  });

  it('claimDailyBonus gelingt nur einmal pro Kalendertag', () => {
    expect(useStore.getState().claimDailyBonus()).toBe(true);
    expect(useStore.getState().claimDailyBonus()).toBe(false);

    jest.setSystemTime(new Date('2026-01-02T10:00:00Z'));
    expect(useStore.getState().claimDailyBonus()).toBe(true);
  });

  it('finishLesson vergibt die volle XP plus Bonus bei einer fehlerfreien Runde', () => {
    const { xpGained } = useStore.getState().finishLesson({
      lessonId: 'greetings-1',
      correct: 5,
      total: 5,
      answers: [{ termId: 'a', correct: true }],
    });
    expect(xpGained).toBe(XP_PER_LESSON + XP_PERFECT_BONUS);
  });

  it('finishLesson gibt beim Wiederholen derselben Lektion weniger XP', () => {
    const first = useStore.getState().finishLesson({
      lessonId: 'greetings-1',
      correct: 3,
      total: 5,
      answers: [],
    });
    const second = useStore.getState().finishLesson({
      lessonId: 'greetings-1',
      correct: 3,
      total: 5,
      answers: [],
    });
    expect(second.xpGained).toBeLessThan(first.xpGained);
  });

  it('die Tagesserie erhoeht sich an aufeinanderfolgenden Tagen', () => {
    useStore.getState().finishLesson({ lessonId: 'l1', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().streak).toBe(1);

    jest.setSystemTime(new Date('2026-01-02T10:00:00Z'));
    useStore.getState().finishLesson({ lessonId: 'l2', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().streak).toBe(2);
  });

  it('die Tagesserie reisst nach einem ausgelassenen Tag ab', () => {
    useStore.getState().finishLesson({ lessonId: 'l1', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().streak).toBe(1);

    jest.setSystemTime(new Date('2026-01-04T10:00:00Z')); // ein Tag ausgelassen
    useStore.getState().finishLesson({ lessonId: 'l2', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().streak).toBe(1);
  });

  it('mehrfaches Lernen am selben Tag laesst die Tagesserie unveraendert', () => {
    useStore.getState().finishLesson({ lessonId: 'l1', correct: 1, total: 1, answers: [] });
    useStore.getState().finishLesson({ lessonId: 'l2', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().streak).toBe(1);
  });

  it('perfectStreak zaehlt fehlerfreie Lektionen und reisst bei der ersten unperfekten', () => {
    useStore.getState().finishLesson({ lessonId: 'l1', correct: 5, total: 5, answers: [] });
    useStore.getState().finishLesson({ lessonId: 'l2', correct: 5, total: 5, answers: [] });
    expect(useStore.getState().perfectStreak).toBe(2);

    useStore.getState().finishLesson({ lessonId: 'l3', correct: 3, total: 5, answers: [] });
    expect(useStore.getState().perfectStreak).toBe(0);
  });

  it('startedCoursesCount zaehlt den aktiven Kurs erst nach der ersten abgeschlossenen Lektion', () => {
    useStore.setState({ native: 'de', target: 'en' });
    expect(useStore.getState().startedCoursesCount()).toBe(0);

    useStore.getState().finishLesson({ lessonId: 'l1', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().startedCoursesCount()).toBe(1);

    useStore.getState().setCourse('de', 'es');
    useStore.getState().finishLesson({ lessonId: 'l1', correct: 1, total: 1, answers: [] });
    expect(useStore.getState().startedCoursesCount()).toBe(2);
  });

  it('serializeProgress/restoreProgress sichern und stellen den Fortschritt wieder her', () => {
    useStore.getState().finishLesson({ lessonId: 'l1', correct: 1, total: 1, answers: [] });
    useStore.setState({ gems: 777 });
    const backup = serializeProgress();
    expect(isProgressBackup(backup)).toBe(true);

    useStore.getState().reset();
    expect(useStore.getState().gems).not.toBe(777);

    restoreProgress(backup);
    expect(useStore.getState().gems).toBe(777);
    expect(useStore.getState().completed.l1).toBe(1);
  });

  it('isProgressBackup verwirft fremde/kaputte Dateien', () => {
    expect(isProgressBackup(null)).toBe(false);
    expect(isProgressBackup({})).toBe(false);
    expect(isProgressBackup({ app: 'other-app', state: {} })).toBe(false);
    expect(isProgressBackup({ app: 'g04speak', state: {} })).toBe(true);
  });
});
