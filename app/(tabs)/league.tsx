import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../../src/data/i18n';
import { buildLeaderboard, leagueForLevel } from '../../src/lib/league';
import { levelFromXp, useStore } from '../../src/store/useStore';
import { ThemeColors, font, radius, spacing, useThemeColors } from '../../src/theme/theme';

/** Die oberen Plaetze steigen auf, die unteren ab - wie in der Wochenliga. */
const PROMOTION_ZONE = 5;
const DEMOTION_ZONE = 5;

export default function League() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const native = useStore((s) => s.native);
  const xp = useStore((s) => s.xp);
  const weeklyXp = useStore((s) => s.weeklyXp);
  const strings = t(native);

  const league = leagueForLevel(levelFromXp(xp));
  const board = useMemo(
    () => buildLeaderboard(weeklyXp, strings.you),
    [weeklyXp, strings.you],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={[styles.header, { backgroundColor: league.color }]}>
        <MaterialCommunityIcons name="shield-star" size={48} color={colors.textOnDark} />
        <View style={styles.titleRow}>
          <Text accessibilityRole="header" style={styles.leagueName}>{league.name}</Text>
          <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View>
        </View>
        <Text style={styles.leagueDesc}>{strings.leagueDesc}</Text>
      </View>

      <FlatList
        data={board}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const rank = index + 1;
          const promoted = rank <= PROMOTION_ZONE;
          const demoted = rank > board.length - DEMOTION_ZONE;

          return (
            <View style={[styles.row, item.isUser && styles.rowUser]}>
              <Text
                style={[
                  styles.rank,
                  promoted && { color: colors.green },
                  demoted && { color: colors.red },
                ]}
              >
                {rank}
              </Text>
              <MaterialCommunityIcons
                name="account-circle"
                size={34}
                color={item.isUser ? colors.blue : colors.border}
              />
              <Text style={[styles.name, item.isUser && styles.nameUser]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.xp}>{item.xp} XP</Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  leagueName: { ...font.h1, color: colors.textOnDark },
  leagueDesc: { ...font.small, color: 'rgba(255,255,255,0.9)' },
  list: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  demoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  demoText: { fontSize: 10, fontWeight: '800', color: colors.textOnDark, letterSpacing: 0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowUser: { backgroundColor: '#DDF4FF' },
  rank: { ...font.h3, color: colors.textMuted, width: 26 },
  name: { ...font.body, color: colors.text, flex: 1 },
  nameUser: { fontWeight: '800' },
  xp: { ...font.small, color: colors.textMuted },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 70 },
});
