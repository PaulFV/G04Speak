import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES } from '../../data/languages';
import { BuildExercise } from '../../lib/exercises';
import { ThemeColors, font, radius, spacing, useThemeColors } from '../../theme/theme';

interface Props {
  exercise: BuildExercise;
  onChange: (answer: string) => void;
  locked: boolean;
}

interface Tile {
  /** Eindeutig, weil dasselbe Wort mehrfach vorkommen kann. */
  id: number;
  word: string;
}

/** Satzbau aus Wort-Kacheln: unten der Vorrat, oben die gebaute Zeile. */
export function BuildCard({ exercise, onChange, locked }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [bank, setBank] = useState<Tile[]>([]);
  const [line, setLine] = useState<Tile[]>([]);

  useEffect(() => {
    setBank(exercise.tokens.map((word, id) => ({ id, word })));
    setLine([]);
    onChange('');
    // Nur beim Wechsel der Aufgabe zuruecksetzen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.key]);

  function update(nextLine: Tile[], nextBank: Tile[]) {
    setLine(nextLine);
    setBank(nextBank);
    onChange(nextLine.map((tile) => tile.word).join(' '));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.prompt}>
        <Text style={styles.promptLanguage}>{LANGUAGES[exercise.promptLang].name}</Text>
        <Text style={styles.promptText}>{exercise.prompt}</Text>
      </View>

      <View style={styles.line}>
        {line.map((tile) => (
          <Tile
            key={tile.id}
            word={tile.word}
            styles={styles}
            onPress={
              locked
                ? undefined
                : () => update(line.filter((t) => t.id !== tile.id), [...bank, tile])
            }
          />
        ))}
        <View style={styles.rule} />
      </View>

      <View style={styles.bank}>
        {bank.map((tile) => (
          <Tile
            key={tile.id}
            word={tile.word}
            styles={styles}
            onPress={
              locked
                ? undefined
                : () => update([...line, tile], bank.filter((t) => t.id !== tile.id))
            }
          />
        ))}
      </View>
    </View>
  );
}

type Styles = ReturnType<typeof createStyles>;

function Tile({ word, onPress, styles }: { word: string; onPress?: () => void; styles: Styles }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
    >
      <Text style={styles.tileText}>{word}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { gap: spacing.xl },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promptLanguage: { ...font.small, color: colors.blue, minWidth: 86 },
  promptText: { ...font.h3, color: colors.text, flex: 1 },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: 108,
    alignContent: 'flex-start',
  },
  rule: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 46,
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  tilePressed: { borderBottomWidth: 2, marginTop: 2 },
  tileText: { ...font.body, color: colors.text },
});
