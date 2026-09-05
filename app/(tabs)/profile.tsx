import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '../../src/components/ProgressBar';
import { t } from '../../src/data/i18n';
import { LANGUAGES } from '../../src/data/languages';
import { TERMS } from '../../src/data/vocabulary';
import { DailyGoal, levelFromXp, useStore, xpIntoLevel } from '../../src/store/useStore';
import { colors, font, radius, spacing } from '../../src/theme/theme';

const GOALS: DailyGoal[] = [10, 20, 30, 50];

export default function Profile() {
  const router = useRouter();
  const native = useStore((s) => s.native);
  const target = useStore((s) => s.target);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const dailyGoal = useStore((s) => s.dailyGoal);
  const setDailyGoal = useStore((s) => s.setDailyGoal);
  const learned = useStore((s) => s.learnedCount());
  const reset = useStore((s) => s.reset);

  const strings = t(native);
  const level = levelFromXp(xp);

  function confirmReset() {
    Alert.alert(strings.resetProgress, strings.resetDesc, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.confirm,
        style: 'destructive',
        onPress: () => {
          reset();
          router.replace('/onboarding');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={48} color={colors.textOnDark} />
          </View>
          <Text style={styles.course}>
            {native ? LANGUAGES[native].flag : ''} → {target ? LANGUAGES[target].flag : ''}{' '}
            {target ? LANGUAGES[target].name : ''}
          </Text>
        </View>

        <View style={styles.levelBox}>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>
              {strings.level} {level}
            </Text>
            <Text style={styles.levelXp}>{xpIntoLevel(xp)} / 100 XP</Text>
          </View>
          <ProgressBar value={xpIntoLevel(xp) / 100} />
        </View>

        <View style={styles.stats}>
          <Stat icon="fire" color={colors.orange} value={streak} label={strings.streakDays} />
          <Stat icon="lightning-bolt" color={colors.gold} value={xp} label={strings.totalXp} />
          <Stat
            icon="text-box-check"
            color={colors.purple}
            value={`${learned}/${TERMS.length}`}
            label={strings.words}
          />
        </View>

        <Text style={styles.sectionTitle}>{strings.dailyGoal}</Text>
        <View style={styles.goals}>
          {GOALS.map((goal) => (
            <Pressable
              key={goal}
              accessibilityRole="radio"
              accessibilityState={{ selected: dailyGoal === goal }}
              onPress={() => setDailyGoal(goal)}
              style={[styles.goalChip, dailyGoal === goal && styles.goalChipActive]}
            >
              <Text style={[styles.goalText, dailyGoal === goal && styles.goalTextActive]}>
                {goal} XP
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{strings.settings}</Text>

        <Pressable style={styles.item} onPress={() => router.push('/onboarding')}>
          <MaterialCommunityIcons name="swap-horizontal" size={22} color={colors.blue} />
          <Text style={styles.itemText}>{strings.changeCourse}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.lockedText} />
        </Pressable>

        <Pressable style={styles.item} onPress={confirmReset}>
          <MaterialCommunityIcons name="delete-outline" size={22} color={colors.red} />
          <Text style={[styles.itemText, { color: colors.red }]}>{strings.resetProgress}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  value: number | string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  course: { ...font.h3, color: colors.text },
  levelBox: { gap: spacing.xs },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelText: { ...font.h3, color: colors.text },
  levelXp: { ...font.small, color: colors.textMuted },
  stats: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  statValue: { ...font.h3, color: colors.text },
  statLabel: { ...font.small, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: { ...font.h3, color: colors.text, marginTop: spacing.sm },
  goals: { flexDirection: 'row', gap: spacing.sm },
  goalChip: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  goalChipActive: { borderColor: colors.orange, backgroundColor: '#FFF4E0' },
  goalText: { ...font.small, color: colors.textMuted },
  goalTextActive: { color: colors.orange },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: { ...font.body, color: colors.text, flex: 1 },
});
