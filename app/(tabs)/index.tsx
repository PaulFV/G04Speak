import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PathNode } from '../../src/components/PathNode';
import { ProgressBar } from '../../src/components/ProgressBar';
import { TopBar } from '../../src/components/TopBar';
import { t } from '../../src/data/i18n';
import { COURSE, Lesson, isUnlocked, nextLesson } from '../../src/lib/course';
import { useStore } from '../../src/store/useStore';
import { colors, font, radius, spacing } from '../../src/theme/theme';

/** Waagerechte Verschiebung der Knoten - erzeugt den geschlaengelten Pfad. */
const WAVE = [0, 40, 60, 40, 0, -40, -60, -40];

export default function LearnPath() {
  const router = useRouter();
  const native = useStore((s) => s.native);
  const completed = useStore((s) => s.completed);
  const dailyGoal = useStore((s) => s.dailyGoal);
  const xpToday = useStore((s) => s.xpToday);
  const regenerateHearts = useStore((s) => s.regenerateHearts);

  const strings = t(native);
  const current = nextLesson(completed);

  // Beim Zurueckkehren auf den Pfad koennen inzwischen Herzen nachgewachsen sein.
  useFocusEffect(
    useCallback(() => {
      regenerateHearts();
    }, [regenerateHearts]),
  );

  function open(lesson: Lesson) {
    if (!isUnlocked(lesson, completed)) return;
    // Ein direkter Pfad verhindert interne Router-Parameter in der sichtbaren Web-URL.
    router.push(`/lesson/${lesson.id}` as Href);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopBar />

      <View style={styles.goal}>
        <View style={styles.goalRow}>
          <MaterialCommunityIcons name="target" size={18} color={colors.orange} />
          <Text style={styles.goalLabel}>{strings.dailyGoal}</Text>
          <Text style={styles.goalValue}>
            {Math.min(xpToday, dailyGoal)} / {dailyGoal} XP
          </Text>
        </View>
        <ProgressBar value={xpToday / dailyGoal} color={colors.orange} height={12} />
      </View>

      <ScrollView contentContainerStyle={styles.path} showsVerticalScrollIndicator={false}>
        {COURSE.map(({ unit, lessons }) => {
          const done = lessons.filter((l) => completed[l.id]).length;

          return (
            <View key={unit.id} style={styles.section}>
              <View style={[styles.banner, { backgroundColor: unit.color }]}>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerUnit}>{strings.unit}</Text>
                  <Text style={styles.bannerTitle}>{unit.title[native ?? 'de']}</Text>
                </View>
                <View style={styles.bannerCount}>
                  <MaterialCommunityIcons
                    name={unit.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={22}
                    color={colors.textOnDark}
                  />
                  <Text style={styles.bannerCountText}>
                    {done}/{lessons.length}
                  </Text>
                </View>
              </View>

              {lessons.map((lesson) => (
                <PathNode
                  key={lesson.id}
                  state={
                    completed[lesson.id]
                      ? 'done'
                      : isUnlocked(lesson, completed)
                        ? 'current'
                        : 'locked'
                  }
                  color={unit.color}
                  icon={unit.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  isReview={lesson.isReview}
                  offset={WAVE[lesson.order % WAVE.length]}
                  label={current?.id === lesson.id ? strings.start : undefined}
                  accessibilityLabel={`${lesson.isReview ? strings.review : strings.lesson}: ${unit.title[native ?? 'de']}, ${lesson.index}`}
                  accessibilityHint={
                    isUnlocked(lesson, completed) ? undefined : strings.lockedHint
                  }
                  onPress={() => open(lesson)}
                />
              ))}
            </View>
          );
        })}

        <View style={styles.end}>
          <MaterialCommunityIcons name="flag-checkered" size={40} color={colors.lockedText} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  goal: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.bgAlt,
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  goalLabel: { ...font.small, color: colors.textMuted, flex: 1 },
  goalValue: { ...font.small, color: colors.orange },
  path: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingBottom: spacing.xxl * 2,
  },
  section: { marginBottom: spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  bannerText: { flex: 1 },
  bannerUnit: { ...font.small, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  bannerTitle: { ...font.h2, color: colors.textOnDark },
  bannerCount: { alignItems: 'center' },
  bannerCountText: { ...font.small, color: colors.textOnDark, marginTop: 2 },
  end: { alignItems: 'center', paddingVertical: spacing.xl },
});
