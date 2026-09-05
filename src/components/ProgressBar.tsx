import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme/theme';

interface Props {
  /** Wert zwischen 0 und 1 */
  value: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color = colors.green, height = 16 }: Props) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      >
        {clamped > 0.08 && <View style={styles.shine} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    justifyContent: 'flex-start',
    paddingTop: 3,
    paddingHorizontal: 6,
  },
  shine: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
