import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  maxReached,
}: {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxReached?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <Pressable
        onPress={onDecrement}
        hitSlop={6}
        style={styles.btn}>
        <ThemedText style={[styles.sign, { color: theme.secondary }]}>−</ThemedText>
      </Pressable>
      <View style={styles.valueWrap}>
        <ThemedText style={styles.value}>{value}</ThemedText>
      </View>
      <Pressable
        onPress={onIncrement}
        disabled={maxReached}
        hitSlop={6}
        style={styles.btn}>
        <ThemedText
          style={[
            styles.sign,
            { color: maxReached ? theme.textLight : theme.secondary },
          ]}>
          +
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  btn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  sign: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  valueWrap: {
    minWidth: 28,
    alignItems: 'center',
    paddingVertical: 4,
  },
  value: { fontSize: 13, fontWeight: '700' },
});
