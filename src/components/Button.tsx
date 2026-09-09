import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { ThemeColors, font, radius, spacing, useThemeColors } from '../theme/theme';

type Variant = 'primary' | 'danger' | 'secondary' | 'ghost';

function variantsFor(colors: ThemeColors): Record<Variant, { bg: string; edge: string; text: string; border?: string }> {
  return {
    primary: { bg: colors.green, edge: colors.greenDark, text: colors.textOnDark },
    danger: { bg: colors.red, edge: colors.redDark, text: colors.textOnDark },
    secondary: { bg: colors.blue, edge: colors.blueDark, text: colors.textOnDark },
    ghost: { bg: colors.bg, edge: colors.border, text: colors.textMuted, border: colors.border },
  };
}

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/** Der typische, leicht erhabene Button mit farbiger Unterkante. */
export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const colors = useThemeColors();
  const scheme = variantsFor(colors)[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(inactive) }}
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: inactive ? colors.locked : scheme.bg,
          borderBottomColor: inactive ? colors.borderDark : scheme.edge,
          borderWidth: scheme.border ? 2 : 0,
          borderColor: scheme.border ?? 'transparent',
        },
        // Beim Druecken sinkt der Button auf seine Kante.
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnDark} />
      ) : (
        <Text style={[styles.label, { color: inactive ? colors.lockedText : scheme.text }]}>
          {label.toLocaleUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  label: {
    ...font.h3,
    letterSpacing: 0.6,
  },
});
