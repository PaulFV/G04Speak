import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LANGUAGES } from '../../data/languages';
import { TypeExercise } from '../../lib/exercises';
import { speak } from '../../lib/speech';
import { colors, font, radius, spacing } from '../../theme/theme';

interface Props {
  exercise: TypeExercise;
  onChange: (answer: string) => void;
  locked: boolean;
}

/** Freie Eingabe - der schwerste Aufgabentyp. */
export function TypeCard({ exercise, onChange, locked }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue('');
    onChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.key]);

  return (
    <View style={styles.wrap}>
      <View style={styles.prompt}>
        <Text style={styles.promptFlag}>{LANGUAGES[exercise.promptLang].flag}</Text>
        <Text style={styles.promptText}>{exercise.prompt}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={exercise.prompt}
          onPress={() => speak(exercise.prompt, exercise.promptLang)}
        >
          <MaterialCommunityIcons name="volume-high" size={26} color={colors.blue} />
        </Pressable>
      </View>

      <TextInput
        value={value}
        onChangeText={(text) => {
          setValue(text);
          onChange(text);
        }}
        editable={!locked}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        placeholder={LANGUAGES[exercise.answerLang].name}
        placeholderTextColor={colors.lockedText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promptFlag: { fontSize: 30 },
  promptText: { ...font.h3, color: colors.text, flex: 1 },
  input: {
    minHeight: 120,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.bgAlt,
    textAlignVertical: 'top',
    ...font.body,
    color: colors.text,
  },
});
