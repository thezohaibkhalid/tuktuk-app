import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Product } from '@/services/products';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export function ProductCard({
  product,
  width,
}: {
  product: Product;
  width: number;
}) {
  const theme = useTheme();
  const router = useRouter();
  const showSale = product.onSale && typeof product.salePrice === 'number';
  const displayPrice = showSale ? product.salePrice! : product.price;

  return (
    <Pressable
      onPress={() => router.push(`/p/${product.slug}` as never)}
      style={[styles.card, { width, backgroundColor: theme.surface }]}>
      <View style={[styles.imageWrap, { width, height: width }]}>
        <Image
          source={{ uri: product.image }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
        {product.isNew ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.badgeText}>NEW</ThemedText>
          </View>
        ) : null}
        {showSale ? (
          <View
            style={[
              styles.badge,
              styles.badgeRight,
              { backgroundColor: theme.sale },
            ]}>
            <ThemedText style={styles.badgeText}>SALE</ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <ThemedText numberOfLines={2} style={styles.name}>
          {product.name}
        </ThemedText>
        <View style={styles.priceRow}>
          <ThemedText style={[styles.price, { color: theme.secondary }]}>
            {formatPKR(displayPrice)}
          </ThemedText>
          {showSale ? (
            <ThemedText
              style={[styles.strikePrice, { color: theme.textLight }]}>
              {formatPKR(product.price)}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  imageWrap: {
    backgroundColor: '#f1f5f9',
  },
  body: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
  },
  strikePrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  badge: {
    position: 'absolute',
    top: Spacing.one,
    left: Spacing.one,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeRight: {
    left: undefined,
    right: Spacing.one,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
