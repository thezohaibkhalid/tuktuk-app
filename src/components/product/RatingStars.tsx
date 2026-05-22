import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// Lightweight 5-star renderer using unicode glyphs to avoid an icon-font dep.
export function RatingStars({
  rating = 0,
  total,
  size = 14,
}: {
  rating?: number;
  total?: number;
  size?: number;
}) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;

  return (
    <View style={styles.row}>
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i < full || (i === full && hasHalf);
        return (
          <ThemedText
            key={i}
            style={[
              styles.star,
              { fontSize: size, color: isFull ? theme.primary : theme.border },
            ]}>
            ★
          </ThemedText>
        );
      })}
      {total !== undefined ? (
        <ThemedText
          style={[styles.count, { fontSize: size - 2 }]}
          themeColor="textSecondary">
          ({total})
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { letterSpacing: -1 },
  count: { marginLeft: 4 },
});
