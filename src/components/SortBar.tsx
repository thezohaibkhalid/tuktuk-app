import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ProductSearchParams } from '@/services/products';

export type SortValue = NonNullable<ProductSearchParams['sort']>;

const OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export function SortBar({
  value,
  onChange,
  resultCount,
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
  resultCount?: number;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <View style={[styles.bar, { borderBottomColor: theme.borderLight }]}>
      <ThemedText style={styles.count} themeColor="textSecondary">
        {resultCount !== undefined ? `${resultCount} results` : ' '}
      </ThemedText>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.sortBtn, { borderColor: theme.border }]}>
        <ThemedText style={styles.sortLabel} themeColor="textSecondary">
          Sort:
        </ThemedText>
        <ThemedText style={styles.sortValue}>{current.label}</ThemedText>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}>
            <ThemedText style={styles.sheetTitle}>Sort by</ThemedText>
            {OPTIONS.map((o) => {
              const isActive = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.row,
                    isActive && { backgroundColor: theme.primaryLight },
                  ]}>
                  <ThemedText
                    style={[
                      styles.rowText,
                      isActive && {
                        color: theme.secondary,
                        fontWeight: '700',
                      },
                    ]}>
                    {o.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  count: { flex: 1, fontSize: 12 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  sortLabel: { fontSize: 12 },
  sortValue: { fontSize: 12, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  row: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
  },
  rowText: { fontSize: 14 },
});
