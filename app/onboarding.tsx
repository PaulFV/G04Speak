import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { Strings, t } from '../src/data/i18n';
import { LANGUAGE_LIST, Lang, LANGUAGES } from '../src/data/languages';
import { SkillLevel, courseKey, useStore } from '../src/store/useStore';
import { ThemeColors, font, radius, spacing, useThemeColors } from '../src/theme/theme';

type Step = 'native' | 'target' | 'level';

const SKILL_LEVELS: { id: SkillLevel; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'beginner', icon: 'seed-outline' },
  { id: 'advanced', icon: 'trending-up' },
  { id: 'pro', icon: 'rocket-launch-outline' },
  { id: 'teacher', icon: 'school-outline' },
];

/** Uebersetzter Name je Lernlevel. */
function skillLevelLabel(id: SkillLevel, strings: Strings): string {
  switch (id) {
    case 'beginner': return strings.skillBeginner;
    case 'advanced': return strings.skillAdvanced;
    case 'pro': return strings.skillPro;
    case 'teacher': return strings.skillTeacher;
  }
}

/** Kursauswahl in kurzen, klar erkennbaren Schritten. */
export default function Onboarding() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const setCourse = useStore((s) => s.setCourse);
  const savedNative = useStore((s) => s.native);
  const progressByCourse = useStore((s) => s.progressByCourse);
  const { width } = useWindowDimensions();

  const [native, setNative] = useState<Lang | null>(savedNative);
  const [target, setTarget] = useState<Lang | null>(null);
  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [step, setStep] = useState<Step>(savedNative ? 'target' : 'native');

  // Vor der Wahl der Muttersprache zeigen wir die App auf Deutsch.
  const strings = t(native);
  const compact = width < 560;

  // Ein bereits einmal gelerntes Sprachpaar hat seinen Fortschritt (und sein
  // Lernlevel) schon gespeichert - dann muss nicht erneut nach dem Level
  // gefragt werden, wir springen direkt zurueck in den Kurs.
  function hasExistingProgress(nativeLang: Lang, targetLang: Lang): boolean {
    return Boolean(progressByCourse[courseKey(nativeLang, targetLang)]);
  }

  // Solange noch keine Zielsprache gewaehlt ist, wissen wir nicht, ob der
  // Level-Schritt noch kommt - wir nehmen dann optimistisch "ja" an, damit
  // die Anzeige nicht nachtraeglich von "2" auf "3" hochzaehlt.
  const needsLevelStep = !(native && target && hasExistingProgress(native, target));
  const stepNumber = step === 'native' ? 1 : step === 'target' ? 2 : 3;
  const totalSteps = needsLevelStep ? 3 : 2;

  function choose(language: Lang) {
    if (step === 'native') {
      setNative(language);
      setTarget(null);
      return;
    }
    setTarget(language);
  }

  function goBack() {
    if (step === 'level') {
      setStep('target');
      return;
    }
    setStep('native');
    setTarget(null);
  }

  function goToNextFromTarget() {
    if (!native || !target) return;
    if (hasExistingProgress(native, target)) {
      start(null);
      return;
    }
    setLevel(null);
    setStep('level');
  }

  function start(startLevel: SkillLevel | null) {
    if (!native || !target) return;
    setCourse(native, target, startLevel ?? undefined);
    router.replace('/(tabs)');
  }

  const languages = LANGUAGE_LIST.filter(
    (language) => step === 'native' || language.code !== native,
  );

  const stepTitle = step === 'native' ? strings.iSpeak : step === 'target' ? strings.iLearn : strings.levelQuestion;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shell}>
          <View style={styles.hero}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="G04Speak"
              source={require('../assets/gospeak-space-icon-floating.png')}
              style={styles.logoMark}
            />
            <View style={styles.heroCopy}>
              <Text style={styles.logo}>G04Speak</Text>
              <Text style={styles.tagline}>{strings.tagline}</Text>
              <View style={styles.trustRow}>
                <TrustItem icon="translate" label={strings.languagesBadge} colors={colors} styles={styles} />
                <TrustItem icon="swap-horizontal" label={strings.coursesBadge} colors={colors} styles={styles} />
                <TrustItem icon="shield-check-outline" label={strings.privateBadge} colors={colors} styles={styles} />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <View style={styles.stepHeaderText}>
                <Text style={styles.eyebrow}>{stepNumber} / {totalSteps}</Text>
                <Text accessibilityRole="header" style={styles.question}>
                  {stepTitle}
                </Text>
                {step === 'level' ? <Text style={styles.levelHint}>{strings.levelHint}</Text> : null}
              </View>
              <View accessibilityLabel={`${stepNumber} von ${totalSteps}`} style={styles.dots}>
                {Array.from({ length: totalSteps }, (_, index) => (
                  <View key={index} style={index < stepNumber ? styles.dotActive : styles.dot} />
                ))}
              </View>
            </View>

            {step === 'level' ? (
              <View accessibilityRole="radiogroup" style={styles.grid}>
                {SKILL_LEVELS.map((levelOption) => {
                  const selected = level === levelOption.id;
                  return (
                    <Pressable
                      key={levelOption.id}
                      accessibilityLabel={skillLevelLabel(levelOption.id, strings)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setLevel(levelOption.id)}
                      style={({ pressed }) => [
                        styles.languageCard,
                        { width: compact ? '48%' : '31.5%' },
                        selected && styles.languageCardSelected,
                        pressed && styles.languageCardPressed,
                      ]}
                    >
                      <View style={[styles.flagBadge, { backgroundColor: `${colors.purple}14` }]}>
                        <MaterialCommunityIcons name={levelOption.icon} size={21} color={colors.purple} />
                      </View>
                      <Text numberOfLines={1} style={[styles.cardName, selected && styles.languageCardSelectedText]}>
                        {skillLevelLabel(levelOption.id, strings)}
                      </Text>
                      {selected ? (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={colors.blue}
                          style={styles.check}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View accessibilityRole="radiogroup" style={styles.grid}>
                {languages.map((language) => {
                  const selected = step === 'native' ? native === language.code : target === language.code;
                  return (
                    <Pressable
                      key={language.code}
                      accessibilityLabel={language.name}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => choose(language.code)}
                      style={({ pressed }) => [
                        styles.languageCard,
                        { width: compact ? '48%' : '31.5%' },
                        selected && styles.languageCardSelected,
                        pressed && styles.languageCardPressed,
                      ]}
                    >
                      <View style={[styles.flagBadge, { backgroundColor: `${language.color}14` }]}>
                        <MaterialCommunityIcons name="translate" size={21} color={language.code === 'de' ? colors.blue : language.color} />
                      </View>
                      <Text numberOfLines={1} style={[styles.cardName, selected && styles.languageCardSelectedText]}>
                        {language.name}
                      </Text>
                      {selected ? (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={colors.blue}
                          style={styles.check}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={styles.footer}>
              {step !== 'native' ? (
                <Pressable
                  accessibilityLabel={`${strings.iSpeak}: ${native ? LANGUAGES[native].name : ''}. Zurück`}
                  accessibilityRole="button"
                  onPress={goBack}
                  style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
                >
                  <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textMuted} />
                  <Text style={styles.backText}>
                    {step === 'level' && target ? LANGUAGES[target].name : native ? LANGUAGES[native].name : ''}
                  </Text>
                </Pressable>
              ) : (
                <View />
              )}

              <Button
                label={
                  step === 'native'
                    ? strings.next
                    : step === 'target'
                      ? (needsLevelStep ? strings.next : strings.startLearning)
                      : strings.startLearning
                }
                disabled={step === 'native' ? !native : step === 'target' ? !target : !level}
                onPress={
                  step === 'native'
                    ? () => setStep('target')
                    : step === 'target'
                      ? goToNextFromTarget
                      : () => start(level)
                }
                style={styles.cta}
              />
            </View>
          </View>

          <View style={styles.privacyNote}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={colors.purple} />
            <Text style={styles.privacyText}>{strings.privacyNote}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Styles = ReturnType<typeof createStyles>;

function TrustItem({
  icon,
  label,
  colors,
  styles,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  colors: ThemeColors;
  styles: Styles;
}) {
  return (
    <View style={styles.trustItem}>
      <MaterialCommunityIcons name={icon} size={13} color={colors.blueDark} />
      <Text style={styles.trustText}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  // "flex-start" statt "center", damit Logo und Text weiter oben sitzen,
  // statt auf dem ganzen Bildschirm mittig zu schweben.
  page: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.sm, justifyContent: 'flex-start' },
  shell: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: spacing.lg },
  hero: {
    flexDirection: 'row',
    // "flex-start" statt "center": das Icon richtet sich an der obersten
    // Textzeile aus, statt an der Mitte des ganzen (dreizeiligen) Textblocks
    // - dadurch sitzt es sichtbar hoeher.
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: spacing.md,
  },
  // Die "-floating"-Version des Icons hat schon einen weichen, transparenten
  // Rand statt der eckigen App-Icon-Kachel - deshalb hier ohne borderRadius,
  // sonst wuerde die eigene Kante wieder eine Box vortaeuschen.
  logoMark: { width: 104, height: 104 },
  heroCopy: { flexShrink: 1 },
  logo: { fontSize: 40, fontWeight: '900', color: '#4C1D95', letterSpacing: -1.5 },
  tagline: { ...font.body, color: colors.textMuted, marginTop: 2 },
  // Eine einzige Zeile, nach rechts ausgerichtet (weg vom Icon) - dafuer
  // sind die Badges kompakter (kleinere Schrift/Icons/Abstaende) als vorher,
  // sonst passen alle drei auf schmalen Handys nicht in eine Zeile.
  trustRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xs, marginTop: spacing.sm, width: '100%' },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#E6F7FF',
  },
  trustText: { ...font.small, fontSize: 11, color: colors.blueDark },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#DDD8F7',
    backgroundColor: colors.bgAlt,
    gap: spacing.lg,
    shadowColor: '#35236B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepHeaderText: { flex: 1, paddingRight: spacing.md },
  eyebrow: { ...font.small, color: colors.greenDark, letterSpacing: 1 },
  question: { ...font.h1, color: colors.text, marginTop: 2 },
  levelHint: { ...font.body, color: colors.textMuted, marginTop: spacing.xs },
  dots: { flexDirection: 'row', gap: spacing.xs },
  dot: { width: 24, height: 7, borderRadius: radius.pill, backgroundColor: colors.border },
  dotActive: { width: 24, height: 7, borderRadius: radius.pill, backgroundColor: colors.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  languageCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  languageCardSelected: { borderColor: colors.blue, backgroundColor: colors.selectedBg },
  languageCardPressed: { transform: [{ scale: 0.985 }] },
  flagBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { ...font.body, color: colors.text, flex: 1 },
  languageCardSelectedText: { color: colors.text, fontWeight: '700' },
  check: { position: 'absolute', top: 7, right: 7 },
  footer: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  backPressed: { opacity: 0.65 },
  backText: { ...font.body, color: colors.textMuted },
  cta: { flex: 1 },
  privacyNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  privacyText: { ...font.small, color: '#5B43A5', textAlign: 'center' },
});
