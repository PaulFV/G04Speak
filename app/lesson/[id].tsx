import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ProgressBar';
import { BuildCard } from '../../src/components/exercises/BuildCard';
import { ChooseCard } from '../../src/components/exercises/ChooseCard';
import { MatchCard } from '../../src/components/exercises/MatchCard';
import { TypeCard } from '../../src/components/exercises/TypeCard';
import { t } from '../../src/data/i18n';
import { lessonById } from '../../src/lib/course';
import { hapticError, hapticSuccess } from '../../src/lib/haptics';
import { Exercise, buildLesson, isAnswerCorrect, requeue } from '../../src/lib/exercises';
import { speak } from '../../src/lib/speech';
import { dueTermIds } from '../../src/lib/srs';
import { useStore } from '../../src/store/useStore';
import { ThemeColors, font, radius, spacing, useThemeColors } from '../../src/theme/theme';

type Verdict = 'correct' | 'wrong';

export default function LessonScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const native = useStore((s) => s.native);
  const target = useStore((s) => s.target);
  const skillLevel = useStore((s) => s.skillLevel);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const hearts = useStore((s) => s.hearts);
  const gems = useStore((s) => s.gems);
  const stats = useStore((s) => s.stats);
  const loseHeart = useStore((s) => s.loseHeart);
  const regenerateHearts = useStore((s) => s.regenerateHearts);
  const refillHearts = useStore((s) => s.refillHearts);
  const claimDailyBonus = useStore((s) => s.claimDailyBonus);
  const finishLesson = useStore((s) => s.finishLesson);

  const strings = t(native);
  const lesson = id ? lessonById(id) : undefined;

  // Die Uebungen werden einmal pro Lektion gewuerfelt und bleiben dann stabil.
  const [queue, setQueue] = useState<Exercise[]>(() => {
    if (!lesson || !native || !target) return [];
    return buildLesson({
      lesson,
      native,
      target,
      skillLevel,
      soundEnabled,
      // Wiederholungslektionen decken ihre Einheit schon selbst ab.
      reviewTermIds: lesson.isReview ? [] : dueTermIds(stats, 3),
    });
  });

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [feedbackExercise, setFeedbackExercise] = useState<Exercise | null>(null);
  const [done, setDone] = useState(false);
  const dancer = useRef(new Animated.Value(0)).current;

  const tally = useRef({ correct: 0, total: 0 });
  const answers = useRef<{ termId: string; correct: boolean }[]>([]);
  const reward = useRef({ xpGained: 0, leveledUp: false });

  const exercise = queue[index];

  useEffect(() => {
    const timer = setInterval(regenerateHearts, 1000);
    return () => clearInterval(timer);
  }, [regenerateHearts]);

  useEffect(() => {
    if (!done) return;
    dancer.setValue(0);
    Animated.sequence([
      Animated.timing(dancer, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(dancer, { toValue: 0.8, duration: 140, useNativeDriver: true }),
        Animated.timing(dancer, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]),
      Animated.timing(dancer, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [done, dancer]);

  const heading = useMemo(() => {
    if (!exercise) return '';
    switch (exercise.kind) {
      case 'choose':
        return strings.exChoose;
      case 'listen':
        return strings.exListen;
      case 'build':
        return strings.exBuild;
      case 'type':
        return strings.exType;
      case 'match':
        return strings.exMatch;
    }
  }, [exercise, strings]);

  if (!lesson || !native || !target) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Button label={strings.backToPath} onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  function record(termId: string, correct: boolean) {
    tally.current.total += 1;
    if (correct) tally.current.correct += 1;
    answers.current.push({ termId, correct });
  }

  function complete() {
    reward.current = finishLesson({
      lessonId: lesson!.id,
      correct: tally.current.correct,
      total: tally.current.total,
      answers: answers.current,
    });
    setDone(true);
  }

  /** Weiter zur naechsten Aufgabe - oder Lektion abschliessen. */
  function advance() {
    setVerdict(null);
    setFeedbackExercise(null);
    setAnswer('');

    if (index + 1 >= queue.length) {
      complete();
      return;
    }
    setIndex(index + 1);
  }

  function check(given = answer) {
    if (!exercise || exercise.kind === 'match' || verdict) return;

    const correct = isAnswerCorrect(given, exercise.answer);
    setFeedbackExercise(exercise);
    record(exercise.termId, correct);

    if (correct) {
      hapticSuccess();
      speak(exercise.answer, exercise.answerLang);
      setVerdict('correct');
      // Nach kurzer Erfolgsanzeige automatisch zur nächsten Aufgabe.
      setTimeout(() => next(), 900);
      return;
    }

    // Falsch beantwortete Aufgaben wandern ans Ende der Runde und muessen
    // erneut geloest werden, bevor die Lektion endet.
    hapticError();
    loseHeart();
    setVerdict('wrong');
  }

  function selectOption(value: string) {
    setAnswer(value);
    check(value);
  }

  function next() {
    if (verdict === 'wrong') {
      // Erst nach dem Klick auf „Weiter“ wird die falsche Aufgabe ans Ende
      // gestellt. Bis dahin bleiben Frage und Lösung unverändert sichtbar.
      setQueue((list) => requeue(list, index));
      setVerdict(null);
      setAnswer('');
      setFeedbackExercise(null);
      return;
    }
    advance();
  }

  function quit() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`${strings.quitTitle}\n${strings.quitDesc}`)) router.replace('/(tabs)');
      return;
    }
    Alert.alert(strings.quitTitle, strings.quitDesc, [
      { text: strings.keepLearning, style: 'cancel' },
      { text: strings.endLesson, style: 'destructive', onPress: () => router.replace('/(tabs)') },
    ]);
  }

  // ---------- Abschluss ----------
  if (done) {
    const accuracy = tally.current.total
      ? Math.round((tally.current.correct / tally.current.total) * 100)
      : 100;

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.summary}>
          <Animated.View style={[styles.dancerSummary, { transform: [{ translateY: dancer.interpolate({ inputRange: [0, 0.8, 1], outputRange: [22, -8, 0] }) }, { rotate: dancer.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-10deg', '10deg', '0deg'] }) }, { scale: dancer.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}
          >
            <Image source={require('../../assets/gospeak-space-mark.png')} style={styles.dancerLarge} />
          </Animated.View>
          <MaterialCommunityIcons name="trophy" size={96} color={colors.gold} />
          <Text style={styles.summaryTitle}>{strings.complete}</Text>
          <Text style={styles.summarySub}>{strings.goodJob}</Text>

          <View style={styles.summaryStats}>
            <View style={[styles.summaryCard, { borderColor: colors.gold }]}>
              <Text style={[styles.summaryValue, { color: colors.gold }]}>
                +{reward.current.xpGained}
              </Text>
              <Text style={styles.summaryLabel}>{strings.xpEarned}</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: colors.green }]}>
              <Text style={[styles.summaryValue, { color: colors.green }]}>{accuracy}%</Text>
              <Text style={styles.summaryLabel}>{strings.accuracy}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button label={strings.backToPath} onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Keine Herzen mehr ----------
  if (hearts <= 0 && verdict === null) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.summary}>
          <MaterialCommunityIcons name="heart-broken" size={88} color={colors.red} />
          <Text style={styles.summaryTitle}>{strings.noHearts}</Text>
          <Text style={styles.summarySub}>{strings.noHeartsDesc}</Text>
        </View>

        <View style={styles.footer}>
          <Button
            label={`🎁 ${strings.dailyBonus}`}
            variant="secondary"
            onPress={() => {
              if (!claimDailyBonus()) Alert.alert(strings.dailyBonus, strings.dailyBonusClaimed);
            }}
          />
          <Button
            label={strings.refill}
            variant="secondary"
            disabled={gems < 50}
            onPress={() => {
              if (!refillHearts()) Alert.alert(strings.notEnoughGems);
            }}
          />
          <Button label={strings.endLesson} variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Button label={strings.backToPath} onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  const canCheck = exercise.kind !== 'match' && answer.trim().length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={strings.endLesson}
          accessibilityRole="button"
          onPress={quit}
          hitSlop={10}
        >
          <MaterialCommunityIcons name="close" size={28} color={colors.lockedText} />
        </Pressable>
        <View style={styles.headerBar}>
          <ProgressBar value={queue.length ? index / queue.length : 0} />
        </View>
        <View accessibilityLabel={`${strings.hearts}: ${hearts}`} style={styles.headerHearts}>
          <MaterialCommunityIcons name="heart" size={24} color={colors.red} />
          <Text style={styles.heartsText}>{hearts}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text accessibilityRole="header" style={styles.heading}>{heading}</Text>

          {exercise.kind === 'choose' || exercise.kind === 'listen' ? (
            <ChooseCard
              exercise={exercise}
              selected={answer || null}
              onSelect={selectOption}
              locked={verdict !== null}
            />
          ) : null}

          {exercise.kind === 'build' ? (
            <BuildCard exercise={exercise} onChange={setAnswer} locked={verdict !== null} />
          ) : null}

          {exercise.kind === 'type' ? (
            <TypeCard exercise={exercise} onChange={setAnswer} locked={verdict !== null} />
          ) : null}

          {exercise.kind === 'match' ? (
            <MatchCard
              exercise={exercise}
              onComplete={(mistakes) => {
                for (const pair of exercise.pairs) record(pair.termId, mistakes === 0);
                hapticSuccess();
                advance();
              }}
            />
          ) : null}
        </ScrollView>

        {exercise.kind !== 'match' ? (
          <View
            style={[
              styles.footer,
              verdict === 'correct' && styles.footerCorrect,
              verdict === 'wrong' && styles.footerWrong,
            ]}
          >
            {verdict ? (
              <View accessibilityLiveRegion="polite" style={styles.feedback}>
                <MaterialCommunityIcons
                  name={verdict === 'correct' ? 'check-circle' : 'close-circle'}
                  size={28}
                  color={verdict === 'correct' ? colors.greenDark : colors.redDark}
                />
                <View style={styles.flex}>
                  <Text
                    style={[
                      styles.feedbackTitle,
                      { color: verdict === 'correct' ? colors.greenDark : colors.redDark },
                    ]}
                  >
                    {verdict === 'correct' ? strings.correct : strings.wrong}
                  </Text>
                  {verdict === 'wrong' ? (
                    <Text style={styles.feedbackSolution}>
                      {strings.solutionIs} {feedbackExercise && 'answer' in feedbackExercise ? feedbackExercise.answer : exercise.answer}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {verdict !== 'correct' && (!['choose', 'listen'].includes(exercise.kind) || verdict) ? (
              <Button
                label={verdict ? strings.next : strings.check}
                variant={verdict === 'wrong' ? 'danger' : 'primary'}
                disabled={!verdict && !canCheck}
                onPress={verdict ? next : () => check()}
              />
            ) : null}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  headerBar: { flex: 1 },
  headerHearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartsText: { ...font.h3, color: colors.red },
  body: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heading: { ...font.h2, color: colors.text },
  dancerSummary: { marginBottom: spacing.sm },
  dancerLarge: { width: 180, height: 180, borderRadius: 90 },
  footer: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  footerCorrect: { backgroundColor: colors.greenLight, borderTopColor: 'transparent' },
  footerWrong: { backgroundColor: colors.redLight, borderTopColor: 'transparent' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  feedbackTitle: { ...font.h3 },
  feedbackSolution: { ...font.small, color: '#7F1D1D', marginTop: 2, fontWeight: '700' },
  summary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  summaryTitle: { ...font.h1, color: colors.text, textAlign: 'center' },
  summarySub: { ...font.body, color: colors.textMuted, textAlign: 'center' },
  summaryStats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  summaryCard: {
    minWidth: 130,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  summaryValue: { ...font.h1 },
  summaryLabel: { ...font.small, color: colors.textMuted },
});
