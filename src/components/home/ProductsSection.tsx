import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { Spacing } from '@/constants/theme';
import type { Product } from '@/services/products';

import { SectionShell } from './SectionShell';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_CARD_W = 140;
const GRID_GUTTER = Spacing.two;
const GRID_COLS = 2;
const GRID_CARD_W = Math.floor(
  (SCREEN_WIDTH - Spacing.three * 2 - GRID_GUTTER * (GRID_COLS - 1)) / GRID_COLS,
);

export function ProductsSection({
  title,
  subtitle,
  products,
  layout = 'carousel',
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  layout?: 'grid' | 'carousel';
}) {
  if (!products?.length) return null;

  if (layout === 'grid') {
    return (
      <SectionShell title={title} subtitle={subtitle}>
        <View style={styles.grid}>
          {products.map((p) => (
            <View key={p.id} style={{ width: GRID_CARD_W }}>
              <ProductCard product={p} width={GRID_CARD_W} />
            </View>
          ))}
        </View>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={title} subtitle={subtitle}>
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.two }}
        renderItem={({ item }) => (
          <ProductCard product={item} width={CAROUSEL_CARD_W} />
        )}
      />
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GUTTER,
  },
});
