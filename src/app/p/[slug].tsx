import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { AddToCartBar } from '@/components/product/AddToCartBar';
import { Gallery } from '@/components/product/Gallery';
import { RatingStars } from '@/components/product/RatingStars';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getProductBySlug,
  getRelatedProducts,
  type Product,
} from '@/services/products';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, r] = await Promise.all([
          getProductBySlug(slug),
          getRelatedProducts(slug, 10).catch(() => [] as Product[]),
        ]);
        if (cancelled) return;
        setProduct(p);
        setRelated(r);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load product');
        setProduct(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (product === undefined) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator color={theme.primary} />
      </ThemedView>
    );
  }

  if (product === null) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <ThemedText style={styles.errorTitle}>Product not found</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorBody}>
          {error ?? 'This product is no longer available.'}
        </ThemedText>
      </ThemedView>
    );
  }

  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.media?.length
        ? product.media.filter((m) => m.type === 'image').map((m) => m.url)
        : product.image
          ? [product.image]
          : [];

  const showSale =
    product.onSale && typeof product.salePrice === 'number';
  const displayPrice = showSale ? product.salePrice! : product.price;
  const outOfStock = product.isSaleable === false || product.stock === 0;

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Gallery images={images} />

        <View style={styles.body}>
          {product.brand ? (
            <ThemedText themeColor="textSecondary" style={styles.brand}>
              {product.brand}
            </ThemedText>
          ) : null}
          <ThemedText style={styles.name}>{product.name}</ThemedText>

          {product.rating?.average ? (
            <RatingStars
              rating={product.rating.average}
              total={product.rating.total}
              size={14}
            />
          ) : null}

          <View style={styles.priceRow}>
            <ThemedText style={[styles.price, { color: theme.secondary }]}>
              {formatPKR(displayPrice)}
            </ThemedText>
            {showSale ? (
              <>
                <ThemedText
                  style={[styles.strikePrice, { color: theme.textLight }]}>
                  {formatPKR(product.price)}
                </ThemedText>
                <View
                  style={[styles.saveBadge, { backgroundColor: theme.sale }]}>
                  <ThemedText style={styles.saveBadgeText}>
                    Save {formatPKR(product.price - displayPrice)}
                  </ThemedText>
                </View>
              </>
            ) : null}
          </View>

          {outOfStock ? (
            <View
              style={[
                styles.stockChip,
                { backgroundColor: theme.dangerLight },
              ]}>
              <ThemedText style={[styles.stockText, { color: theme.danger }]}>
                Out of stock
              </ThemedText>
            </View>
          ) : product.stock !== undefined && product.stock > 0 ? (
            <View
              style={[
                styles.stockChip,
                { backgroundColor: theme.successLight },
              ]}>
              <ThemedText style={[styles.stockText, { color: theme.success }]}>
                In stock
                {product.stock < 10 ? ` · only ${product.stock} left` : ''}
              </ThemedText>
            </View>
          ) : null}

          {product.shortDescription ? (
            <ThemedText style={styles.shortDesc} themeColor="textSecondary">
              {product.shortDescription}
            </ThemedText>
          ) : null}

          {product.description ? (
            <View style={styles.block}>
              <ThemedText style={styles.blockTitle}>Description</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.blockBody}>
                {product.description}
              </ThemedText>
            </View>
          ) : null}

          {product.specs?.length ? (
            <View style={styles.block}>
              <ThemedText style={styles.blockTitle}>Specifications</ThemedText>
              <View
                style={[
                  styles.specTable,
                  { borderColor: theme.borderLight },
                ]}>
                {product.specs.map((s, idx) => (
                  <View
                    key={`${s.label}-${idx}`}
                    style={[
                      styles.specRow,
                      idx !== product.specs!.length - 1 && {
                        borderBottomColor: theme.borderLight,
                        borderBottomWidth: 1,
                      },
                    ]}>
                    <ThemedText
                      style={styles.specLabel}
                      themeColor="textSecondary">
                      {s.label}
                    </ThemedText>
                    <ThemedText style={styles.specValue}>{s.value}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {related.length > 0 ? (
            <View style={styles.block}>
              <ThemedText style={styles.blockTitle}>You may also like</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedRow}>
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} width={140} />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AddToCartBar
        price={displayPrice}
        disabled={outOfStock}
        onAdd={() => {
          Alert.alert(
            'Cart coming soon',
            'Cart functionality is part of the next phase.',
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  errorTitle: { fontSize: 16, fontWeight: '700' },
  errorBody: { fontSize: 13, textAlign: 'center' },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  brand: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  price: { fontSize: 22, fontWeight: '900' },
  strikePrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  stockChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  stockText: { fontSize: 12, fontWeight: '700' },
  shortDesc: { fontSize: 13, lineHeight: 19, marginTop: Spacing.one },
  block: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  blockBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  specTable: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  specLabel: {
    flex: 1,
    fontSize: 12,
  },
  specValue: {
    flex: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  relatedRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
