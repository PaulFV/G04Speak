import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useStore } from '../src/store/useStore';
import { colors } from '../src/theme/theme';

/**
 * Einstiegspunkt: wer noch keinen Kurs gewaehlt hat, landet im Onboarding,
 * alle anderen direkt im Lernpfad.
 */
export default function Index() {
  const hydrated = useStore((s) => s.hydrated);
  const native = useStore((s) => s.native);
  const target = useStore((s) => s.target);

  // Warten, bis der gespeicherte Fortschritt geladen ist.
  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return native && target ? <Redirect href="/(tabs)" /> : <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
