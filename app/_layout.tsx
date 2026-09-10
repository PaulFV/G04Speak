import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { t } from '../src/data/i18n';
import { cancelAllReminders, syncHeartsFullReminder, syncStreakReminder } from '../src/lib/notifications';
import { useStore } from '../src/store/useStore';

/**
 * Haelt die beiden lokalen Erinnerungen (Serie/Herzen) mit dem aktuellen
 * Zustand synchron - ausgeloest bei jeder Aenderung, die sie betreffen
 * koennte (Einstellung umgeschaltet, Lektion abgeschlossen, Herzen verloren
 * oder nachgewachsen, App neu gestartet).
 */
function useReminderSync() {
  const remindersEnabled = useStore((s) => s.remindersEnabled);
  const native = useStore((s) => s.native);
  const lastActiveDay = useStore((s) => s.lastActiveDay);
  const hearts = useStore((s) => s.hearts);
  const heartsUpdatedAt = useStore((s) => s.heartsUpdatedAt);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const strings = t(native);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (!remindersEnabled) {
      cancelAllReminders();
      return;
    }
    syncStreakReminder(lastActiveDay, todayKey, strings);
    syncHeartsFullReminder(hearts, heartsUpdatedAt, strings);
  }, [remindersEnabled, native, lastActiveDay, hearts, heartsUpdatedAt, hydrated]);
}

export default function RootLayout() {
  const themeMode = useStore((s) => s.themeMode);
  useReminderSync();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
