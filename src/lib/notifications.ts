import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Strings } from '../data/i18n';
import { HEART_REGEN_MS, MAX_HEARTS } from '../store/useStore';

/**
 * Lokale Erinnerungen (Tagesserie in Gefahr, Herzen wieder voll).
 *
 * Bewusst ohne Server oder Konto: alles wird auf dem Geraet selbst geplant.
 * Weil es dafuer keinen Hintergrunddienst gibt, der taeglich pruefen koennte,
 * ob schon gelernt wurde, wird bei jeder Gelegenheit (App-Start, nach einer
 * Lektion, beim Aendern der Einstellung) neu berechnet, ob und wann die
 * naechste Erinnerung faellig ist - es gibt hoechstens eine ausstehende
 * Serien- und eine ausstehende Herzen-Erinnerung gleichzeitig.
 *
 * Auf Web gibt es keine verlaessliche lokale Terminplanung (die Seite muss
 * dafuer geoeffnet bleiben) - dort bleiben alle Funktionen hier bewusst wirkungslos.
 */

const STREAK_REMINDER_ID = 'g04speak-streak-reminder';
const HEARTS_FULL_ID = 'g04speak-hearts-full';
/** Uhrzeit (lokale Zeit), zu der an eine gefaehrdete Tagesserie erinnert wird. */
const STREAK_REMINDER_HOUR = 20;

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let handlerConfigured = false;

function configureHandler() {
  if (handlerConfigured || !supported) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', {
      name: 'Erinnerungen',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => { /* Kanal existiert eventuell schon. */ });
  }
}

/** Fragt bei Bedarf um Erlaubnis. Liefert false, wenn abgelehnt oder nicht unterstuetzt. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  configureHandler();
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

async function cancel(identifier: string) {
  if (!supported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Nichts geplant - kein Fehlerfall.
  }
}

/** Naechster Zeitpunkt fuer die Serien-Erinnerung: heute, falls die Uhrzeit noch bevorsteht, sonst morgen. */
function nextStreakReminderDate(now = new Date()): Date {
  const date = new Date(now);
  date.setHours(STREAK_REMINDER_HOUR, 0, 0, 0);
  if (date.getTime() <= now.getTime()) date.setDate(date.getDate() + 1);
  return date;
}

/**
 * Plant die Serien-Erinnerung neu oder sagt sie ab.
 *
 * @param lastActiveDay Kalendertag (yyyy-mm-dd) der letzten abgeschlossenen Lektion.
 * @param today Heutiger Kalendertag, im selben Format.
 */
export async function syncStreakReminder(lastActiveDay: string | null, today: string, strings: Strings): Promise<void> {
  if (!supported) return;
  await cancel(STREAK_REMINDER_ID);
  // Heute schon gelernt - keine Erinnerung noetig, die naechste wird nach
  // Mitternacht (beim naechsten App-Start bzw. nach der naechsten Lektion) neu geplant.
  if (lastActiveDay === today) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_REMINDER_ID,
      content: { title: strings.streakReminderTitle, body: strings.streakReminderBody },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextStreakReminderDate() },
    });
  } catch {
    // Keine Berechtigung oder Geraet unterstuetzt es nicht - Erinnerung faellt einfach aus.
  }
}

/** Plant die "Herzen wieder voll"-Erinnerung neu oder sagt sie ab, wenn die Herzen schon voll sind. */
export async function syncHeartsFullReminder(hearts: number, heartsUpdatedAt: number, strings: Strings): Promise<void> {
  if (!supported) return;
  await cancel(HEARTS_FULL_ID);
  if (hearts >= MAX_HEARTS) return;

  const missing = MAX_HEARTS - hearts;
  const readyAt = heartsUpdatedAt + missing * HEART_REGEN_MS;
  if (readyAt <= Date.now()) return; // regenerateHearts() im Store holt das gleich nach.

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: HEARTS_FULL_ID,
      content: { title: strings.heartsFullTitle, body: strings.heartsFullBody },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(readyAt) },
    });
  } catch {
    // Keine Berechtigung oder Geraet unterstuetzt es nicht - Erinnerung faellt einfach aus.
  }
}

/** Sagt beide Erinnerungen ab - z. B. wenn die Einstellung ausgeschaltet wird. */
export async function cancelAllReminders(): Promise<void> {
  await cancel(STREAK_REMINDER_ID);
  await cancel(HEARTS_FULL_ID);
}
