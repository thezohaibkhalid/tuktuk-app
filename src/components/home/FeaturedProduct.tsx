import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Product } from '@/services/products';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export function FeaturedProduct({
  product,
  headline,
  subtitle,
  badgeText,
  ctaText,
}: {
  product: Product;
  headline?: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
}) {
  const theme = useTheme();
  const router = useRouter();
  const goToProduct = () => router.push(`/p/${product.slug}` as never);
  const showSale = product.onSale && typeof product.salePrice === 'number';
  const displayPrice = showSale ? product.salePrice! : product.price;

  return (
    <View style={styles.outer}>
      <Pressable
        onPress={goToProduct}
        style={[
          styles.card,
          { backgroundColor: theme.secondary },
        ]}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
          />
          {badgeText ? (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <ThemedText style={[styles.badgeText, { color: theme.secondary }]}>
                {badgeText}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          {headline ? (
            <ThemedText style={[styles.headline, { color: theme.primary }]}>
              {headline}
            </ThemedText>
          ) : null}
          <ThemedText style={styles.name} numberOfLines={2}>
            {product.name}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </ThemedText>
          ) : null}
          <View style={styles.priceRow}>
            <ThemedText style={[styles.price, { color: theme.primary }]}>
              {formatPKR(displayPrice)}
            </ThemedText>
            {showSale ? (
              <ThemedText style={styles.strikePrice}>
                {formatPKR(product.price)}
              </ThemedText>
            ) : null}
          </View>
          <Pressable
            style={[styles.cta, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            onPress={goToProduct}>
            <ThemedText style={[styles.ctaText, { color: theme.secondary }]}>
              {ctaText ?? 'Shop now'}
            </ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  imageWrap: {
    width: 140,
    height: 220,
    backgroundColor: '#0e1736',
  },
  body: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.one,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  strikePrice: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  cta: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: Spacing.one,
    left: Spacing.one,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
