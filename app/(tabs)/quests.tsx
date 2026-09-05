import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '../../src/components/ProgressBar';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { t } from '../../src/data/i18n';
import { levelFromXp, useStore } from '../../src/store/useStore';
import { colors, font, radius, spacing } from '../../src/theme/theme';

export default function Quests() {
  const native = useStore((s) => s.native);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const completed = useStore((s) => s.completed);
  const learnedWords = useStore((s) => s.learnedCount());
  const strings = t(native);

  const source = {
    xp,
    streak,
    learnedWords,
    lessonsCompleted: Object.keys(completed).length,
    level: levelFromXp(xp),
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>{strings.tabQuests}</Text>
        <Text style={styles.subtitle}>{strings.questsDesc}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ACHIEVEMENTS.map((achievement) => {
          const value = Math.min(achievement.value(source), achievement.target);
          const unlocked = value >= achievement.target;

          return (
            <View key={achievement.id} style={styles.card}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: unlocked ? achievement.color : colors.locked },
                ]}
              >
                <MaterialCommunityIcons
                  name={achievement.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={28}
                  color={unlocked ? colors.textOnDark : colors.lockedText}
                />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{achievement.title[native ?? 'de']}</Text>
                <ProgressBar
                  value={value / achievement.target}
                  color={unlocked ? achievement.color : colors.borderDark}
                  height={10}
                />
                <Text style={styles.cardCount}>
                  {value} / {achievement.target}
                </Text>
              </View>

              {unlocked ? (
                <MaterialCommunityIcons name="check-circle" size={22} color={achievement.color} />
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: spacing.lg, gap: spacing.xs },
  title: { ...font.h1, color: colors.text },
  subtitle: { ...font.body, color: colors.textMuted },
  list: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  badge: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { ...font.h3, color: colors.text },
  cardCount: { ...font.small, color: colors.textMuted },
});
