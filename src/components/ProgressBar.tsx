import { StyleSheet, View } from 'react-native';

import { radius, useThemeColors } from '../theme/theme';

interface Props {
  /** Wert zwischen 0 und 1 */
  value: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 16 }: Props) {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(1, value));
  const fillColor = color ?? colors.green;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: fillColor, borderRadius: height / 2 },
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
