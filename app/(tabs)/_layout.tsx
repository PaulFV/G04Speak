import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../../src/data/i18n';
import { useStore } from '../../src/store/useStore';
import { useThemeColors } from '../../src/theme/theme';

export default function TabsLayout() {
  const colors = useThemeColors();
  const strings = t(useStore((s) => s.native));
  // Auf dem iPhone (v.a. als "Zum Home-Bildschirm hinzufuegen"-App im
  // Vollbild) liegt unten der Home-Indikator - ohne diesen Abstand ragt die
  // Tableiste darunter, und der Bereich dahinter blieb bisher unlackiert (weiss).
  const insets = useSafeAreaInsets();

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
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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
