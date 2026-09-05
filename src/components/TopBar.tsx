import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { LANGUAGES } from '../data/languages';
import { MAX_HEARTS, useStore } from '../store/useStore';
import { colors, font, spacing } from '../theme/theme';

/** Kopfzeile mit Kurs-Flagge, Tagesserie, Edelsteinen und Herzen. */
export function TopBar() {
  const target = useStore((s) => s.target);
  const streak = useStore((s) => s.streak);
  const gems = useStore((s) => s.gems);
  const hearts = useStore((s) => s.hearts);

  return (
    <View style={styles.row}>
      <Text style={styles.flag}>{target ? LANGUAGES[target].flag : '🏳️'}</Text>

      <Stat icon="fire" color={streak > 0 ? colors.orange : colors.lockedText} value={streak} />
      <Stat icon="diamond-stone" color={colors.blue} value={gems} />
      <Stat
        icon={hearts > 0 ? 'heart' : 'heart-outline'}
        color={hearts > 0 ? colors.red : colors.lockedText}
        value={`${hearts}/${MAX_HEARTS}`}
      />
    </View>
  );
}

function Stat({
  icon,
  color,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  value: number | string;
}) {
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  flag: { fontSize: 28 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statValue: { ...font.h3 },
});
