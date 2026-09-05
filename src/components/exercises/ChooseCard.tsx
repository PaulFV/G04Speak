import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES } from '../../data/languages';
import { ChooseExercise, ListenExercise } from '../../lib/exercises';
import { speak } from '../../lib/speech';
import { colors, font, radius, spacing } from '../../theme/theme';

interface Props {
  exercise: ChooseExercise | ListenExercise;
  selected: string | null;
  onSelect: (value: string) => void;
  locked: boolean;
}

/**
 * Auswahl aus vier Moeglichkeiten - fuer Uebersetzungen und fuer Hoeraufgaben.
 * Bei der Hoeraufgabe steht statt des Textes ein Lautsprecher.
 */
export function ChooseCard({ exercise, selected, onSelect, locked }: Props) {
  const isListening = exercise.kind === 'listen';

  return (
    <View style={styles.wrap}>
      {isListening ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={exercise.answer}
          onPress={() => speak(exercise.answer, exercise.answerLang)}
          style={({ pressed }) => [styles.speaker, pressed && styles.speakerPressed]}
        >
          <MaterialCommunityIcons name="volume-high" size={44} color={colors.textOnDark} />
        </Pressable>
      ) : (
        <View style={styles.prompt}>
          <Text style={styles.promptFlag}>{LANGUAGES[exercise.promptLang].flag}</Text>
          <Text style={styles.promptText}>{exercise.prompt}</Text>
        </View>
      )}

      <View style={styles.options}>
        {exercise.options.map((option) => {
          const active = selected === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: locked }}
              onPress={locked ? undefined : () => onSelect(option)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && !locked && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promptFlag: { fontSize: 34 },
  promptText: { ...font.h2, color: colors.text, flex: 1 },
  speaker: {
    alignSelf: 'flex-start',
    width: 92,
    height: 92,
    borderRadius: radius.lg,
    backgroundColor: colors.blue,
    borderBottomWidth: 4,
    borderBottomColor: colors.blueDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerPressed: { borderBottomWidth: 0, marginTop: 4 },
  options: { gap: spacing.md },
  option: {
    padding: spacing.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  optionActive: { borderColor: colors.blue, backgroundColor: '#DDF4FF' },
  optionPressed: { borderBottomWidth: 2, marginTop: 2 },
  optionText: { ...font.body, color: colors.text },
  optionTextActive: { color: colors.blueDark },
});
