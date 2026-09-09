import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeColors, font, useThemeColors } from '../theme/theme';

export type NodeState = 'done' | 'current' | 'locked';

interface Props {
  state: NodeState;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isReview: boolean;
  /** Waagerechte Verschiebung, die den Pfad schlaengeln laesst. */
  offset: number;
  label?: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress: () => void;
}

/** Ein Kreis auf dem Lernpfad. */
export function PathNode({
  state,
  color,
  icon,
  isReview,
  offset,
  label,
  accessibilityLabel,
  accessibilityHint,
  onPress,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locked = state === 'locked';
  const face = locked ? colors.locked : isReview ? colors.gold : color;
  const edge = locked ? colors.borderDark : shade(face, colors);

  return (
    <View style={[styles.wrap, { transform: [{ translateX: offset }] }]}>
      {state === 'current' && label ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{label}</Text>
          <View style={styles.bubbleTail} />
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        onPress={locked ? undefined : onPress}
        style={({ pressed }) => [
          styles.node,
          { backgroundColor: face, borderBottomColor: edge },
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name={locked ? 'lock' : isReview ? 'trophy' : icon}
          size={32}
          color={locked ? colors.lockedText : colors.textOnDark}
        />
      </Pressable>

      {state === 'done' ? (
        <View style={styles.check}>
          <MaterialCommunityIcons name="check-bold" size={14} color={colors.textOnDark} />
        </View>
      ) : null}
    </View>
  );
}

/** Dunklere Variante einer Farbe fuer die Unterkante. */
function shade(hex: string, colors: ThemeColors): string {
  const value = hex.replace('#', '');
  if (value.length !== 6) return colors.borderDark;
  const rgb = [0, 2, 4].map((i) => Math.round(parseInt(value.slice(i, i + 2), 16) * 0.75));
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { alignItems: 'center', alignSelf: 'center', width: 72, marginVertical: 10 },
  node: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 6,
  },
  pressed: { borderBottomWidth: 0, marginTop: 6 },
  check: {
    position: 'absolute',
    right: -8,
    bottom: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
  },
  bubbleText: { ...font.small, color: colors.green, letterSpacing: 0.5 },
  bubbleTail: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 12,
    height: 12,
    backgroundColor: colors.bg,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
});
