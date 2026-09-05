import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptisches Feedback.
 *
 * expo-haptics gibt es nur auf iOS und Android. Im Browser wirft der Aufruf
 * einen Fehler, deshalb laufen die Funktionen dort ins Leere.
 */
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

function notify(type: Haptics.NotificationFeedbackType) {
  if (!supported) return;
  Haptics.notificationAsync(type).catch(() => {
    // Manche Geraete haben keinen Vibrationsmotor - das ist kein Fehler.
  });
}

export function hapticSuccess() {
  notify(Haptics.NotificationFeedbackType.Success);
}

export function hapticError() {
  notify(Haptics.NotificationFeedbackType.Error);
}
