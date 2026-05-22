import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export function AddToCartBar({
  price,
  onAdd,
  onViewCart,
  disabled,
  added,
}: {
  price: number;
  onAdd: () => void;
  onViewCart?: () => void;
  disabled?: boolean;
  added?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderLight,
        },
      ]}>
      <View style={styles.priceBlock}>
        <ThemedText themeColor="textSecondary" style={styles.label}>
          Total
        </ThemedText>
        <ThemedText style={[styles.price, { color: theme.secondary }]}>
          {formatPKR(price)}
        </ThemedText>
      </View>
      {added && onViewCart ? (
        <Pressable
          onPress={onViewCart}
          style={[styles.cta, { backgroundColor: theme.success }]}>
          <ThemedText style={[styles.ctaText, { color: '#fff' }]}>
            View cart
          </ThemedText>
        </Pressable>
      ) : (
        <Pressable
          onPress={onAdd}
          disabled={disabled}
          style={[
            styles.cta,
            { backgroundColor: disabled ? theme.border : theme.primary },
          ]}>
          <ThemedText style={[styles.ctaText, { color: theme.secondary }]}>
            {disabled ? 'Out of stock' : 'Add to cart'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  priceBlock: { flex: 1 },
  label: { fontSize: 11 },
  price: { fontSize: 18, fontWeight: '800' },
  cta: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.pill,
  },
  ctaText: { fontSize: 14, fontWeight: '800' },
});
