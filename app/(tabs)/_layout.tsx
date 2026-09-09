import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../../src/data/i18n';
import { useStore } from '../../src/store/useStore';
import { useThemeColors } from '../../src/theme/theme';

/**
 * Auf dem iPhone (v.a. als "Zum Home-Bildschirm hinzufuegen"-App im
 * Vollbild) liegt unten der Home-Indikator. react-native-safe-area-context
 * liefert diesen Abstand im Web zuverlaessig als 0 zurueck (die Bruecke
 * kennt Safaris CSS-Umgebungsvariable nicht), UND ein reiner CSS-String wie
 * "calc(64px + env(...))" funktioniert hier ebenfalls nicht: React
 * Navigation liest tabBarStyle.height selbst aus, um den Inhaltsbereich
 * passend abzupolstern, erkennt dabei aber nur echte Zahlen (typeof
 * === 'number') - ein String wird stillschweigend ignoriert und durch eine
 * interne Standardhoehe ersetzt, wodurch Leiste und Inhalt nicht mehr
 * zusammenpassen (genau die Luecke, die trotz der Farbkorrektur bestehen
 * blieb). Deshalb messen wir den Abstand hier per verstecktem DOM-Element
 * einmalig in echten Pixeln und liefern eine normale Zahl.
 */
function useWebBottomInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const probe = document.createElement('div');
    probe.style.position = 'fixed';
    probe.style.bottom = '0';
    probe.style.left = '0';
    probe.style.height = '0';
    probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    document.body.appendChild(probe);
    const measured = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    document.body.removeChild(probe);
    setInset(measured);
  }, []);
  return inset;
}

export default function TabsLayout() {
  const colors = useThemeColors();
  const strings = t(useStore((s) => s.native));
  const insets = useSafeAreaInsets();
  const webBottomInset = useWebBottomInset();

  const bottomInset = Platform.OS === 'web' ? webBottomInset : insets.bottom;
  const bottomHeight = 64 + bottomInset;
  const bottomPadding = 8 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.lockedText,
        tabBarStyle: {
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 2,
          borderTopColor: colors.border,
          height: bottomHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabLearn,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: strings.tabLeague,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: strings.tabQuests,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: strings.tabProfile,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
