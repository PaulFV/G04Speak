import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { LANGUAGES } from '../data/languages';
import { t } from '../data/i18n';
import { MAX_HEARTS, useStore } from '../store/useStore';
import { colors, font, spacing } from '../theme/theme';

/** Kopfzeile mit Kurs-Flagge, Tagesserie, Bitcoin-Guthaben und Herzen. */
export function TopBar() {
  const native = useStore((s) => s.native);
  const target = useStore((s) => s.target);
  const streak = useStore((s) => s.streak);
  const gems = useStore((s) => s.gems);
  const cryptoCurrency = useStore((s) => s.cryptoCurrency);
  const hearts = useStore((s) => s.hearts);
  const strings = t(native);

  return (
    <View style={styles.row}>
      <Text accessibilityLabel={target ? LANGUAGES[target].name : undefined} style={styles.flag}>
        {target ? LANGUAGES[target].name : 'Sprache'}
      </Text>

      <Stat label={strings.streak} icon="fire" color={streak > 0 ? colors.orange : colors.lockedText} value={streak} />
      <Stat label={cryptoCurrency === 'BTC' ? 'Bitcoin' : 'XRP'} icon={cryptoCurrency === 'BTC' ? 'bitcoin' : 'alpha-x-circle'} color={colors.gold} value={cryptoCurrency === 'BTC' ? `₿${gems}` : `XRP ${gems}`} />
      <Stat
        label={strings.hearts}
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
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  value: number | string;
  label: string;
}) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={styles.stat}>
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
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  flag: { ...font.h3, color: colors.text },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statValue: { ...font.h3 },
});
