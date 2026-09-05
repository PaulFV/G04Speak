import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { colors, font, radius, spacing } from '../../src/theme/theme';

type Verdict = 'correct' | 'wrong';

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const native = useStore((s) => s.native);
  const target = useStore((s) => s.target);
  const hearts = useStore((s) => s.hearts);
  const gems = useStore((s) => s.gems);
  const stats = useStore((s) => s.stats);
  const loseHeart = useStore((s) => s.loseHeart);
  const refillHearts = useStore((s) => s.refillHearts);
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
      // Wiederholungslektionen decken ihre Einheit schon selbst ab.
      reviewTermIds: lesson.isReview ? [] : dueTermIds(stats, 3),
    });
  });

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [done, setDone] = useState(false);

  const tally = useRef({ correct: 0, total: 0 });
  const answers = useRef<{ termId: string; correct: boolean }[]>([]);
  const reward = useRef({ xpGained: 0, leveledUp: false });

  const exercise = queue[index];

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
    setAnswer('');

    if (index + 1 >= queue.length) {
      complete();
      return;
    }
    setIndex(index + 1);
  }

  function check() {
    if (!exercise || exercise.kind === 'match' || verdict) return;

    const correct = isAnswerCorrect(answer, exercise.answer);
    record(exercise.termId, correct);

    if (correct) {
      hapticSuccess();
      speak(exercise.answer, exercise.answerLang);
      setVerdict('correct');
      return;
    }

    // Falsch beantwortete Aufgaben wandern ans Ende der Runde und muessen
    // erneut geloest werden, bevor die Lektion endet.
    hapticError();
    loseHeart();
    setQueue((list) => requeue(list, index));
    setVerdict('wrong');
  }

  function next() {
    if (verdict === 'wrong') {
      // requeue hat die Aufgabe entfernt, der Index zeigt bereits auf die
      // naechste - deshalb hier kein Sprung.
      setVerdict(null);
      setAnswer('');
      return;
    }
    advance();
  }

  function quit() {
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
        <Pressable accessibilityRole="button" onPress={quit} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={28} color={colors.lockedText} />
        </Pressable>
        <View style={styles.headerBar}>
          <ProgressBar value={queue.length ? index / queue.length : 0} />
        </View>
        <View style={styles.headerHearts}>
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
          <Text style={styles.heading}>{heading}</Text>

          {exercise.kind === 'choose' || exercise.kind === 'listen' ? (
            <ChooseCard
              exercise={exercise}
              selected={answer || null}
              onSelect={setAnswer}
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
              <View style={styles.feedback}>
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
                      {strings.solutionIs} {exercise.answer}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <Button
              label={verdict ? strings.next : strings.check}
              variant={verdict === 'wrong' ? 'danger' : 'primary'}
              disabled={!verdict && !canCheck}
              onPress={verdict ? next : check}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerBar: { flex: 1 },
  headerHearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartsText: { ...font.h3, color: colors.red },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  heading: { ...font.h2, color: colors.text },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  footerCorrect: { backgroundColor: colors.greenLight, borderTopColor: 'transparent' },
  footerWrong: { backgroundColor: colors.redLight, borderTopColor: 'transparent' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  feedbackTitle: { ...font.h3 },
  feedbackSolution: { ...font.small, color: colors.text, marginTop: 2 },
  summary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
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
