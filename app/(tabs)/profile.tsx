import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '../../src/components/ProgressBar';
import { Strings, t } from '../../src/data/i18n';
import { Lang, LANGUAGES } from '../../src/data/languages';
import { TERMS } from '../../src/data/vocabulary';
import { ALL_LESSONS } from '../../src/lib/course';
import { ensureNotificationPermission } from '../../src/lib/notifications';
import {
  CourseProgress,
  DailyGoal,
  SkillLevel,
  courseKey,
  isProgressBackup,
  levelFromXp,
  restoreProgress,
  serializeProgress,
  useStore,
  xpIntoLevel,
} from '../../src/store/useStore';
import { ThemeColors, font, radius, spacing, useThemeColors } from '../../src/theme/theme';

/** Fortschritt und Profilbild liegen ausschliesslich lokal auf dem Geraet. */
const AVATAR_STORAGE_KEY = 'gospeak-avatar';
const BACKUP_FILE_NAME = 'g04speak-fortschritt.json';

const GOALS: DailyGoal[] = [10, 20, 30, 50];
const SKILL_LEVELS: { id: SkillLevel; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'beginner', icon: 'seed-outline' },
  { id: 'advanced', icon: 'trending-up' },
  { id: 'pro', icon: 'rocket-launch-outline' },
  { id: 'teacher', icon: 'school-outline' },
];

/** Uebersetzter Name je Lernlevel. */
function skillLevelName(id: SkillLevel, strings: Strings): string {
  switch (id) {
    case 'beginner': return strings.skillBeginner;
    case 'advanced': return strings.skillAdvanced;
    case 'pro': return strings.skillPro;
    case 'teacher': return strings.skillTeacher;
  }
}

export default function Profile() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const skillLevel = useStore((s) => s.skillLevel);
  const setSkillLevel = useStore((s) => s.setSkillLevel);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const setSoundEnabled = useStore((s) => s.setSoundEnabled);
  const remindersEnabled = useStore((s) => s.remindersEnabled);
  const setRemindersEnabled = useStore((s) => s.setRemindersEnabled);
  const setNativeLanguage = useStore((s) => s.setNativeLanguage);
  const setCourse = useStore((s) => s.setCourse);
  const completedMap = useStore((s) => s.completed);
  const progressByCourse = useStore((s) => s.progressByCourse);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const backupFileInput = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') setAvatarUri(localStorage.getItem(AVATAR_STORAGE_KEY));
      return;
    }
    AsyncStorage.getItem(AVATAR_STORAGE_KEY).then(setAvatarUri).catch(() => {});
  }, []);

  const strings = t(native);

  async function chooseAvatar() {
    if (Platform.OS === 'web') {
      fileInput.current?.click();
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(strings.changeAvatar, strings.avatarPermissionDenied);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.base64) return;
    const uri = `data:image/jpeg;base64,${asset.base64}`;
    setAvatarUri(uri);
    try { await AsyncStorage.setItem(AVATAR_STORAGE_KEY, uri); } catch { /* Speicher kann voll sein. */ }
  }

  function onAvatarFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const uri = String(reader.result);
      setAvatarUri(uri);
      try { localStorage.setItem(AVATAR_STORAGE_KEY, uri); } catch { /* Speicher kann voll sein. */ }
    };
    reader.readAsDataURL(file);
  }

  async function toggleReminders(next: boolean) {
    if (!next) {
      setRemindersEnabled(false);
      return;
    }
    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert(strings.reminders, strings.remindersPermissionDenied);
      return;
    }
    setRemindersEnabled(true);
  }

  /** Sichert den Fortschritt als teilbare JSON-Datei - ausschliesslich lokal, ohne Server. */
  async function exportProgress() {
    const backup = serializeProgress();
    const json = JSON.stringify(backup, null, 2);

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = BACKUP_FILE_NAME;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        Alert.alert(strings.backupTitle, strings.backupExportError);
      }
      return;
    }

    try {
      const fileUri = `${FileSystem.cacheDirectory}${BACKUP_FILE_NAME}`;
      await FileSystem.writeAsStringAsync(fileUri, json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: strings.backupExport });
      }
    } catch {
      Alert.alert(strings.backupTitle, strings.backupExportError);
    }
  }

  function applyBackupText(raw: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      Alert.alert(strings.backupTitle, strings.backupImportError);
      return;
    }
    if (!isProgressBackup(parsed)) {
      Alert.alert(strings.backupTitle, strings.backupImportError);
      return;
    }

    Alert.alert(strings.backupImportConfirmTitle, strings.backupImportConfirmDesc, [
      { text: strings.cancel, style: 'cancel' },
      {
        text: strings.confirm,
        style: 'destructive',
        onPress: () => {
          restoreProgress(parsed);
          Alert.alert(strings.backupTitle, strings.backupImportSuccess);
        },
      },
    ]);
  }

  function importProgress() {
    if (Platform.OS === 'web') {
      backupFileInput.current?.click();
      return;
    }
    DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true })
      .then(async (result) => {
        if (result.canceled || !result.assets?.[0]) return;
        const text = await FileSystem.readAsStringAsync(result.assets[0].uri);
        applyBackupText(text);
      })
      .catch(() => Alert.alert(strings.backupTitle, strings.backupImportError));
  }

  function onBackupFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyBackupText(String(reader.result ?? ''));
    reader.readAsText(file);
    event.target.value = '';
  }

  const level = levelFromXp(xp);

  // Uebersicht ueber alle Sprachen, die je gestartet wurden - der aktuell
  // aktive Kurs liegt bis zum naechsten Sprachwechsel noch nicht in
  // progressByCourse, deshalb wird er hier zusaetzlich eingemischt.
  const totalLessons = ALL_LESSONS.length;
  const activeKey = native && target ? courseKey(native, target) : null;
  const historyEntries = useMemo(() => {
    const merged: Record<string, CourseProgress> = { ...progressByCourse };
    if (activeKey && native && target) {
      merged[activeKey] = {
        completed: completedMap,
        stats: {},
        startOrder: 0,
        level: skillLevel ?? 'beginner',
      };
    }
    return Object.keys(merged)
      .map((key) => {
        const [entryNative, entryTarget] = key.split('-') as [Lang, Lang];
        return {
          key,
          native: entryNative,
          target: entryTarget,
          done: Object.keys(merged[key].completed).length,
          isCurrent: key === activeKey,
        };
      })
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent) || b.done - a.done);
  }, [progressByCourse, completedMap, activeKey, native, target, skillLevel]);

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
          <Pressable accessibilityRole="button" accessibilityLabel={strings.changeAvatar} onPress={chooseAvatar} style={styles.avatar}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <MaterialCommunityIcons name="account" size={48} color={colors.textOnDark} />}
            <View pointerEvents="none" style={styles.avatarEdit}><MaterialCommunityIcons name="pencil" size={16} color={colors.textOnDark} /></View>
          </Pressable>
          {Platform.OS === 'web' ? <input ref={fileInput} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: 'none' }} /> : null}
          {Platform.OS === 'web' ? (
            <input ref={backupFileInput} type="file" accept="application/json,.json" onChange={onBackupFile} style={{ display: 'none' }} />
          ) : null}
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
          <Stat icon="fire" color={colors.orange} value={streak} label={strings.streakDays} styles={styles} />
          <Stat icon="lightning-bolt" color={colors.gold} value={xp} label={strings.totalXp} styles={styles} />
          <Stat
            icon="text-box-check"
            color={colors.purple}
            value={`${learned}/${TERMS.length}`}
            label={strings.words}
            styles={styles}
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

        <Text style={styles.settingHint}>{strings.yourLanguage}</Text>
        <View style={styles.levelChoices}>
          {Object.values(LANGUAGES).map((language) => (
            <Pressable key={language.code} accessibilityRole="radio" accessibilityLabel={language.name} accessibilityState={{ selected: native === language.code }} onPress={() => setNativeLanguage(language.code)} style={[styles.levelChip, native === language.code && styles.levelChipActive]}>
              <Text style={[styles.levelChipText, native === language.code && styles.levelChipTextActive]}>{language.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.settingHint}>{strings.skillLevel}</Text>
        <View style={styles.levelChoices}>
          {SKILL_LEVELS.map((levelOption) => (
            <Pressable key={levelOption.id} accessibilityRole="radio" accessibilityState={{ selected: skillLevel === levelOption.id }} onPress={() => setSkillLevel(levelOption.id)} style={[styles.levelChip, skillLevel === levelOption.id && styles.levelChipActive]}>
              <MaterialCommunityIcons name={levelOption.icon} size={18} color={skillLevel === levelOption.id ? colors.blue : colors.textMuted} />
              <Text style={[styles.levelChipText, skillLevel === levelOption.id && styles.levelChipTextActive]}>{skillLevelName(levelOption.id, strings)}</Text>
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

        {historyEntries.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{strings.languageHistory}</Text>
            <View style={styles.historyList}>
              {historyEntries.map((entry) => (
                <Pressable
                  key={entry.key}
                  accessibilityRole="button"
                  accessibilityLabel={`${LANGUAGES[entry.native].name} → ${LANGUAGES[entry.target].name}: ${entry.done}/${totalLessons} ${strings.lessonsShort}`}
                  disabled={entry.isCurrent}
                  onPress={() => setCourse(entry.native, entry.target)}
                  style={[styles.historyItem, entry.isCurrent && styles.historyItemActive]}
                >
                  <View style={styles.historyRow}>
                    <Text style={styles.historyText}>
                      {LANGUAGES[entry.native].name} → {LANGUAGES[entry.target].name}
                    </Text>
                    {entry.isCurrent ? (
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyBadgeText}>{strings.currentCourse}</Text>
                      </View>
                    ) : (
                      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.lockedText} />
                    )}
                  </View>
                  <ProgressBar value={entry.done / totalLessons} height={8} />
                  <Text style={styles.historyCount}>
                    {entry.done}/{totalLessons} {strings.lessonsShort}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

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
          accessibilityRole="switch"
          accessibilityLabel={`${strings.sound} ${soundEnabled ? strings.disabled : strings.enabled}`}
          accessibilityState={{ checked: soundEnabled }}
          accessibilityHint={strings.soundOffHint}
          style={styles.item}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          <MaterialCommunityIcons name={soundEnabled ? 'volume-high' : 'volume-off'} size={22} color={colors.purple} />
          <Text style={styles.itemText}>{strings.sound}</Text>
          <Text style={styles.modeValue}>{soundEnabled ? strings.enabled : strings.disabled}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={`${strings.reminders} ${remindersEnabled ? strings.disabled : strings.enabled}`}
          accessibilityState={{ checked: remindersEnabled }}
          accessibilityHint={strings.remindersHint}
          style={styles.item}
          onPress={() => toggleReminders(!remindersEnabled)}
        >
          <MaterialCommunityIcons name={remindersEnabled ? 'bell-ring-outline' : 'bell-off-outline'} size={22} color={colors.purple} />
          <Text style={styles.itemText}>{strings.reminders}</Text>
          <Text style={styles.modeValue}>{remindersEnabled ? strings.enabled : strings.disabled}</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>{strings.backupTitle}</Text>

        <Pressable accessibilityRole="button" accessibilityLabel={strings.backupExport} style={styles.item} onPress={exportProgress}>
          <MaterialCommunityIcons name="tray-arrow-up" size={22} color={colors.blue} />
          <Text style={styles.itemText}>{strings.backupExport}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.lockedText} />
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel={strings.backupImport} style={styles.item} onPress={importProgress}>
          <MaterialCommunityIcons name="tray-arrow-down" size={22} color={colors.blue} />
          <Text style={styles.itemText}>{strings.backupImport}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.lockedText} />
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

type Styles = ReturnType<typeof createStyles>;

function Stat({
  icon,
  color,
  value,
  label,
  styles,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  value: number | string;
  label: string;
  styles: Styles;
}) {
  return (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  goalChipActive: { borderColor: colors.orange, backgroundColor: colors.selectedWarnBg },
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
  historyList: { gap: spacing.sm },
  historyItem: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  historyItemActive: { borderColor: colors.blue, backgroundColor: colors.selectedBg },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyText: { ...font.body, color: colors.text },
  historyCount: { ...font.small, color: colors.textMuted },
  historyBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.blue },
  historyBadgeText: { ...font.small, color: colors.textOnDark },
  settingHint: { ...font.small, color: colors.textMuted },
  levelChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  levelChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 2, borderColor: colors.border, borderRadius: radius.pill },
  levelChipActive: { borderColor: colors.blue, backgroundColor: colors.selectedBg },
  levelChipText: { ...font.small, color: colors.textMuted },
  levelChipTextActive: { color: colors.blue },
});
