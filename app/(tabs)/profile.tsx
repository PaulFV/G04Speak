import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '../../src/components/ProgressBar';
import { t } from '../../src/data/i18n';
import { LANGUAGES } from '../../src/data/languages';
import { TERMS } from '../../src/data/vocabulary';
import { DailyGoal, SkillLevel, levelFromXp, useStore, xpIntoLevel } from '../../src/store/useStore';
import { colors, font, radius, spacing } from '../../src/theme/theme';

const GOALS: DailyGoal[] = [10, 20, 30, 50];
const SKILL_LEVELS: { id: SkillLevel; name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'beginner', name: 'Anfänger', icon: 'seed-outline' },
  { id: 'advanced', name: 'Fortgeschritten', icon: 'trending-up' },
  { id: 'pro', name: 'Profi', icon: 'rocket-launch-outline' },
  { id: 'teacher', name: 'Lehrer', icon: 'school-outline' },
];

export default function Profile() {
  const router = useRouter();
  const native = useStore((s) => s.native);
  const target = useStore((s) => s.target);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const dailyGoal = useStore((s) => s.dailyGoal);
  const setDailyGoal = useStore((s) => s.setDailyGoal);
  const learned = useStore((s) => s.learnedCount());
  const reset = useStore((s) => s.reset);
  const themeMode = useStore((s) => s.themeMode);
  const setThemeMode = useStore((s) => s.setThemeMode);
  const cryptoCurrency = useStore((s) => s.cryptoCurrency);
  const setCryptoCurrency = useStore((s) => s.setCryptoCurrency);
  const skillLevel = useStore((s) => s.skillLevel);
  const setSkillLevel = useStore((s) => s.setSkillLevel);
  const setNativeLanguage = useStore((s) => s.setNativeLanguage);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') setAvatarUri(localStorage.getItem('gospeak-avatar'));
  }, []);

  function chooseAvatar() {
    if (Platform.OS !== 'web') {
      Alert.alert('Profilbild', 'Die Bildauswahl ist aktuell in der Web-Version verfügbar.');
      return;
    }
    fileInput.current?.click();
  }

  function onAvatarFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const uri = String(reader.result);
      setAvatarUri(uri);
      try { localStorage.setItem('gospeak-avatar', uri); } catch { /* Speicher kann voll sein. */ }
    };
    reader.readAsDataURL(file);
  }

  const strings = t(native);
  const level = levelFromXp(xp);

  function confirmReset() {
    Alert.alert(strings.resetProgress, strings.resetDesc, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.confirm,
        style: 'destructive',
        onPress: () => {
          reset();
          router.replace('/onboarding');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Pressable accessibilityRole="button" accessibilityLabel="Profilbild ändern" onPress={chooseAvatar} style={styles.avatar}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <MaterialCommunityIcons name="account" size={48} color={colors.textOnDark} />}
            <View pointerEvents="none" style={styles.avatarEdit}><MaterialCommunityIcons name="pencil" size={16} color={colors.textOnDark} /></View>
          </Pressable>
          {Platform.OS === 'web' ? <input ref={fileInput} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: 'none' }} /> : null}
          <Text accessibilityRole="header" style={styles.course}>
            {native ? LANGUAGES[native].name : ''} → {target ? LANGUAGES[target].name : ''}
          </Text>
        </View>

        <View style={styles.levelBox}>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>
              {strings.level} {level}
            </Text>
            <Text style={styles.levelXp}>{xpIntoLevel(xp)} / 100 XP</Text>
          </View>
          <ProgressBar value={xpIntoLevel(xp) / 100} />
        </View>

        <View style={styles.stats}>
          <Stat icon="fire" color={colors.orange} value={streak} label={strings.streakDays} />
          <Stat icon="lightning-bolt" color={colors.gold} value={xp} label={strings.totalXp} />
          <Stat
            icon="text-box-check"
            color={colors.purple}
            value={`${learned}/${TERMS.length}`}
            label={strings.words}
          />
        </View>

        <Text style={styles.sectionTitle}>{strings.dailyGoal}</Text>
        <View style={styles.goals}>
          {GOALS.map((goal) => (
            <Pressable
              key={goal}
              accessibilityRole="radio"
              accessibilityState={{ selected: dailyGoal === goal }}
              onPress={() => setDailyGoal(goal)}
              style={[styles.goalChip, dailyGoal === goal && styles.goalChipActive]}
            >
              <Text style={[styles.goalText, dailyGoal === goal && styles.goalTextActive]}>
                {goal} XP
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{strings.settings}</Text>

        <Text style={styles.settingHint}>Eigene Sprache</Text>
        <View style={styles.levelChoices}>
          {Object.values(LANGUAGES).map((language) => (
            <Pressable key={language.code} accessibilityRole="radio" accessibilityLabel={language.name} accessibilityState={{ selected: native === language.code }} onPress={() => setNativeLanguage(language.code)} style={[styles.levelChip, native === language.code && styles.levelChipActive]}>
              <Text style={[styles.levelChipText, native === language.code && styles.levelChipTextActive]}>{language.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.settingHint}>Lernlevel</Text>
        <View style={styles.levelChoices}>
          {SKILL_LEVELS.map((levelOption) => (
            <Pressable key={levelOption.id} accessibilityRole="radio" accessibilityState={{ selected: skillLevel === levelOption.id }} onPress={() => setSkillLevel(levelOption.id)} style={[styles.levelChip, skillLevel === levelOption.id && styles.levelChipActive]}>
              <MaterialCommunityIcons name={levelOption.icon} size={18} color={skillLevel === levelOption.id ? colors.blue : colors.textMuted} />
              <Text style={[styles.levelChipText, skillLevel === levelOption.id && styles.levelChipTextActive]}>{levelOption.name}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.changeCourse}
          style={styles.item}
          onPress={() => router.push('/onboarding')}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={22} color={colors.blue} />
          <Text style={styles.itemText}>{strings.changeCourse}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.lockedText} />
        </Pressable>

        <View style={styles.cryptoRow}>
          <Text style={styles.itemText}>Krypto-Belohnung</Text>
          <View style={styles.cryptoChoices}>
            {(['BTC', 'XRP'] as const).map((currency) => (
              <Pressable
                key={currency}
                accessibilityRole="radio"
                accessibilityLabel={currency === 'BTC' ? 'Bitcoin' : 'XRP'}
                accessibilityState={{ selected: cryptoCurrency === currency }}
                onPress={() => setCryptoCurrency(currency)}
                style={[styles.cryptoChip, cryptoCurrency === currency && styles.cryptoChipActive]}
              >
                <Text style={[styles.cryptoText, cryptoCurrency === currency && styles.cryptoTextActive]}>
                  {currency === 'BTC' ? '₿ BTC' : 'XRP'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={themeMode === 'dark' ? `${strings.lightMode} aktivieren` : `${strings.darkMode} aktivieren`}
          accessibilityState={{ checked: themeMode === 'dark' }}
          style={styles.item}
          onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        >
          <MaterialCommunityIcons name={themeMode === 'dark' ? 'weather-sunny' : 'weather-night'} size={22} color={colors.purple} />
          <Text style={styles.itemText}>{themeMode === 'dark' ? strings.lightMode : strings.darkMode}</Text>
          <Text style={styles.modeValue}>{themeMode === 'dark' ? strings.enabled : strings.disabled}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.resetProgress}
          style={styles.item}
          onPress={confirmReset}
        >
          <MaterialCommunityIcons name="delete-outline" size={22} color={colors.red} />
          <Text style={[styles.itemText, { color: colors.red }]}>{strings.resetProgress}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  hero: { alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 48 },
  avatarEdit: { position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.purple, borderWidth: 3, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  course: { ...font.h3, color: colors.text },
  levelBox: { gap: spacing.xs },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  levelText: { ...font.h3, color: colors.text },
  levelXp: { ...font.small, color: colors.textMuted },
  stats: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  statValue: { ...font.h3, color: colors.text },
  statLabel: { ...font.small, color: colors.textMuted, textAlign: 'center' },
  sectionTitle: { ...font.h3, color: colors.text, marginTop: spacing.sm },
  goals: { flexDirection: 'row', gap: spacing.sm },
  goalChip: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  goalChipActive: { borderColor: colors.orange, backgroundColor: '#3A2B12' },
  goalText: { ...font.small, color: colors.textMuted },
  goalTextActive: { color: colors.orange },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: { ...font.body, color: colors.text, flex: 1 },
  modeValue: { ...font.small, color: colors.textMuted },
  cryptoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  cryptoChoices: { flexDirection: 'row', gap: spacing.sm },
  cryptoChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 2, borderColor: colors.border, borderRadius: radius.pill },
  cryptoChipActive: { borderColor: colors.gold, backgroundColor: '#3A2B12' },
  cryptoText: { ...font.small, color: colors.textMuted },
  cryptoTextActive: { color: '#FFD166' },
  settingHint: { ...font.small, color: colors.textMuted },
  levelChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  levelChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 2, borderColor: colors.border, borderRadius: radius.pill },
  levelChipActive: { borderColor: colors.blue, backgroundColor: '#102F45' },
  levelChipText: { ...font.small, color: colors.textMuted },
  levelChipTextActive: { color: colors.blue },
});
