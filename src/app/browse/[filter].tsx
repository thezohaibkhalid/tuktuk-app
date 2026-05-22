import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProductGrid } from '@/components/ProductGrid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getProductsSection, type Product, type ProductFilter } from '@/services/products';

const FILTER_TITLES: Record<ProductFilter, string> = {
  featured: 'Featured Products',
  'for-her': 'For Her',
};

export default function BrowseFilterScreen() {
  const { filter } = useLocalSearchParams<{ filter: string }>();
  const theme = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Browse');

  const load = useCallback(async () => {
    if (!filter) return;
    setError(null);
    try {
      const section = await getProductsSection(filter as ProductFilter);
      setProducts(section.products ?? []);
      setTitle(section.title || FILTER_TITLES[filter as ProductFilter] || 'Browse');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title }} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (error && products.length === 0) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title }} />
        <View style={styles.center}>
          <ThemedText style={styles.errorTitle}>Couldn&apos;t load</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorBody}>
            {error}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title }} />
      <ProductGrid
        products={products}
        refreshing={refreshing}
        onRefresh={onRefresh}
        emptyMessage="Nothing here yet."
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
    gap: Spacing.two,
    padding: Spacing.four,
  },
  errorTitle: { fontSize: 16, fontWeight: '700' },
  errorBody: { fontSize: 13, textAlign: 'center' },
});
