import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MatchExercise } from '../../lib/exercises';
import { shuffle } from '../../lib/exercises';
import { speak } from '../../lib/speech';
import { colors, font, radius, spacing } from '../../theme/theme';

interface Props {
  exercise: MatchExercise;
  /** Wird ausgeloest, sobald alle Paare gefunden sind. */
  onComplete: (mistakes: number) => void;
}

type Side = 'left' | 'right';
interface Cell {
  termId: string;
  text: string;
  side: Side;
}

/**
 * Zuordnungsspiel zum Aufwaermen: links die Muttersprache, rechts die
 * Lernsprache. Es gibt keinen Pruefen-Knopf, die Runde laeuft von selbst.
 */
export function MatchCard({ exercise, onComplete }: Props) {
  const [left, setLeft] = useState<Cell[]>([]);
  const [right, setRight] = useState<Cell[]>([]);
  const [picked, setPicked] = useState<Cell | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  // Der Schluessel allein reicht nicht: dieselbe Lektion erzeugt beim
  // erneuten Oeffnen denselben Schluessel, aber andere Begriffe.
  const identity = exercise.pairs.map((p) => p.termId).join('|');

  useEffect(() => {
    setLeft(shuffle(exercise.pairs.map((p) => ({ termId: p.termId, text: p.left, side: 'left' as Side }))));
    setRight(shuffle(exercise.pairs.map((p) => ({ termId: p.termId, text: p.right, side: 'right' as Side }))));
    setPicked(null);
    setSolved([]);
    setMistakes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.key, identity]);

  function tap(cell: Cell) {
    if (solved.includes(cell.termId)) return;

    if (cell.side === 'right') speak(cell.text, exercise.rightLang);

    if (!picked || picked.side === cell.side) {
      setPicked(cell);
      return;
    }

    if (picked.termId === cell.termId) {
      const next = [...solved, cell.termId];
      setSolved(next);
      setPicked(null);
      if (next.length === exercise.pairs.length) onComplete(mistakes);
      return;
    }

    // Falsches Paar: kurz rot aufblitzen lassen.
    setMistakes((m) => m + 1);
    setWrongPair(cell.termId);
    setPicked(null);
    setTimeout(() => setWrongPair(null), 350);
  }

  const column = (cells: Cell[]) => (
    <View style={styles.column}>
      {cells.map((cell) => {
        const done = solved.includes(cell.termId);
        const active = picked?.termId === cell.termId && picked.side === cell.side;
        const wrong = wrongPair === cell.termId;

        return (
          <Pressable
            key={`${cell.side}-${cell.termId}`}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: done }}
            onPress={() => tap(cell)}
            style={[
              styles.cell,
              active && styles.cellActive,
              wrong && styles.cellWrong,
              done && styles.cellDone,
            ]}
          >
            <Text
              style={[styles.cellText, active && styles.cellTextActive, done && styles.cellTextDone]}
              numberOfLines={2}
            >
              {cell.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {column(left)}
      {column(right)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.md },
  cell: {
    minHeight: 62,
    padding: spacing.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderColor: colors.blue, backgroundColor: '#DDF4FF' },
  cellWrong: { borderColor: colors.red, backgroundColor: colors.redLight },
  cellDone: { borderColor: 'transparent', backgroundColor: colors.bgAlt, opacity: 0.45 },
  cellText: { ...font.body, color: colors.text, textAlign: 'center' },
  cellTextActive: { color: colors.blueDark },
  cellTextDone: { color: colors.lockedText },
});
