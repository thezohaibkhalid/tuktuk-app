import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ProductGrid } from '@/components/ProductGrid';
import { SortBar, type SortValue } from '@/components/SortBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, type Category, type SubCategory } from '@/services/cms';
import {
  getCategoryProducts,
  type Product,
  type ProductSearchResult,
} from '@/services/products';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const theme = useTheme();

  const [category, setCategory] = useState<Category | null>(null);
  const [subSlug, setSubSlug] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<SortValue>('popularity');

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductSearchResult['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (cancelled) return;
        const match =
          cats.find((c) => c.slug === slug) ??
          cats.find((c) =>
            c.subCategories?.some((s: SubCategory) => s.slug === slug),
          ) ??
          null;
        setCategory(match);
      })
      .catch(() => {
        if (!cancelled) setCategory(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fetchPage = useCallback(
    async (page: number) => {
      if (!slug) return null;
      const reqId = ++requestId.current;
      const res = await getCategoryProducts(slug, subSlug, page, 24);
      if (reqId !== requestId.current) return null;
      return res;
    },
    [slug, subSlug],
  );

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchPage(1);
      if (!res) return;
      const sorted = sortClient(res.data, sort);
      setProducts(sorted);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load category');
      setProducts([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, sort]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || loading) return;
    if (!meta?.hasMore) return;
    setLoadingMore(true);
    try {
      const next = (meta.page ?? 1) + 1;
      const res = await fetchPage(next);
      if (!res) return;
      setProducts((prev) => sortClient([...prev, ...res.data], sort));
      setMeta(res.meta);
    } catch {
      // swallow — user can pull to refresh
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, loading, loadingMore, meta, sort]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const headerTitle = useMemo(() => {
    if (!category) return 'Category';
    if (subSlug) {
      const sub = category.subCategories?.find((s) => s.slug === subSlug);
      if (sub) return sub.name;
    }
    return category.name;
  }, [category, subSlug]);

  const Header = (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>{headerTitle}</ThemedText>
      {category?.subCategories?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          <Pressable
            onPress={() => setSubSlug(undefined)}
            style={[
              styles.chip,
              { borderColor: theme.border },
              !subSlug && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}>
            <ThemedText
              style={[
                styles.chipText,
                !subSlug && { color: theme.secondary, fontWeight: '700' },
              ]}>
              All
            </ThemedText>
          </Pressable>
          {category.subCategories.map((s) => {
            const active = s.slug === subSlug;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSubSlug(s.slug)}
                style={[
                  styles.chip,
                  { borderColor: theme.border },
                  active && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}>
                <ThemedText
                  style={[
                    styles.chipText,
                    active && { color: theme.secondary, fontWeight: '700' },
                  ]}>
                  {s.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      <SortBar value={sort} onChange={setSort} resultCount={meta?.total} />
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: headerTitle }} />
        {Header}
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (error && products.length === 0) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: headerTitle }} />
        {Header}
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
      <Stack.Screen options={{ title: headerTitle }} />
      <ProductGrid
        products={products}
        onEndReached={onEndReached}
        loadingMore={loadingMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={Header}
        emptyMessage="No products in this category yet."
      />
    </ThemedView>
  );
}

// The API supports server-side sort via /products/search, but category endpoints
// may not. Apply a client-side sort so the UI is always responsive.
function sortClient(items: Product[], sort: SortValue): Product[] {
  const arr = [...items];
  switch (sort) {
    case 'price-asc':
      return arr.sort(
        (a, b) =>
          (a.salePrice ?? a.price) - (b.salePrice ?? b.price),
      );
    case 'price-desc':
      return arr.sort(
        (a, b) =>
          (b.salePrice ?? b.price) - (a.salePrice ?? a.price),
      );
    case 'rating':
      return arr.sort(
        (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0),
      );
    case 'newest':
      return arr.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    case 'popularity':
    default:
      return arr;
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: Spacing.three,
  },
  chipsRow: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  chipText: { fontSize: 12 },
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
