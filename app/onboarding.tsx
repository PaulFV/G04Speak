import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { t } from '../src/data/i18n';
import { LANGUAGE_LIST, Lang, LANGUAGES } from '../src/data/languages';
import { useStore } from '../src/store/useStore';
import { colors, font, radius, spacing } from '../src/theme/theme';

/**
 * Kursauswahl in zwei Schritten: erst die Muttersprache, dann die Lernsprache.
 * Aus den acht Sprachen ergeben sich 56 moegliche Kurse.
 */
export default function Onboarding() {
  const router = useRouter();
  const setCourse = useStore((s) => s.setCourse);

  const [native, setNative] = useState<Lang | null>(null);
  const [target, setTarget] = useState<Lang | null>(null);

  // Vor der Wahl der Muttersprache zeigen wir die App auf Deutsch.
  const strings = t(native);
  const step = native ? 'target' : 'native';

  function start() {
    if (!native || !target) return;
    setCourse(native, target);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>GoSpeak</Text>
        <Text style={styles.tagline}>{strings.tagline}</Text>
      </View>

      <Text style={styles.question}>{step === 'native' ? strings.iSpeak : strings.iLearn}</Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {LANGUAGE_LIST
          // Niemand lernt seine eigene Muttersprache.
          .filter((language) => step === 'native' || language.code !== native)
          .map((language) => {
            const selected = step === 'native' ? native === language.code : target === language.code;
            return (
              <Pressable
                key={language.code}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() =>
                  step === 'native' ? setNative(language.code) : setTarget(language.code)
                }
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}
              >
                <Text style={styles.cardFlag}>{language.flag}</Text>
                <Text style={styles.cardName}>{language.name}</Text>
              </Pressable>
            );
          })}
      </ScrollView>

      <View style={styles.footer}>
        {step === 'target' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setNative(null);
              setTarget(null);
            }}
            style={styles.back}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textMuted} />
            <Text style={styles.backText}>
              {LANGUAGES[native as Lang].flag} {LANGUAGES[native as Lang].name}
            </Text>
          </Pressable>
        ) : null}

        <Button
          label={strings.startLearning}
          disabled={!native || !target}
          onPress={start}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  header: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.lg },
  logo: { fontSize: 40, fontWeight: '900', color: colors.green, letterSpacing: -1 },
  tagline: { ...font.body, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  question: { ...font.h2, color: colors.text, marginBottom: spacing.lg },
  grid: { gap: spacing.md, paddingBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  cardSelected: { borderColor: colors.blue, backgroundColor: '#DDF4FF' },
  cardPressed: { borderBottomWidth: 2, marginTop: 2 },
  cardFlag: { fontSize: 30 },
  cardName: { ...font.h3, color: colors.text },
  footer: { paddingVertical: spacing.lg, gap: spacing.md },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { ...font.body, color: colors.textMuted },
});
