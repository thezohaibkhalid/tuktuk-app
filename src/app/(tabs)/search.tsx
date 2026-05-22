import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductGrid } from '@/components/ProductGrid';
import { SortBar, type SortValue } from '@/components/SortBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  searchProducts,
  type Product,
  type ProductSearchResult,
} from '@/services/products';

const DEBOUNCE_MS = 350;

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<SortValue>('popularity');

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductSearchResult['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(
    async (page: number, q: string, s: SortValue) => {
      const reqId = ++requestId.current;
      const res = await searchProducts({ q, page, perPage: 24, sort: s });
      if (reqId !== requestId.current) return null;
      return res;
    },
    [],
  );

  useEffect(() => {
    if (!debounced) {
      setProducts([]);
      setMeta(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    runSearch(1, debounced, sort)
      .then((res) => {
        if (cancelled || !res) return;
        setProducts(res.data);
        setMeta(res.meta);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Search failed');
        setProducts([]);
        setMeta(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, sort, runSearch]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || loading) return;
    if (!meta?.hasMore || !debounced) return;
    setLoadingMore(true);
    try {
      const res = await runSearch((meta.page ?? 1) + 1, debounced, sort);
      if (!res) return;
      setProducts((prev) => [...prev, ...res.data]);
      setMeta(res.meta);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [debounced, loading, loadingMore, meta, runSearch, sort]);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={['top']} style={styles.fill}>
        <View
          style={[
            styles.searchRow,
            { borderBottomColor: theme.borderLight },
          ]}>
          <View
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceSoft,
                borderColor: theme.borderLight,
              },
            ]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search products..."
              placeholderTextColor={theme.textLight}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.inputText, { color: theme.text }]}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <ThemedText themeColor="textSecondary" style={styles.clear}>
                  ✕
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>

        {debounced.length === 0 ? (
          <View style={styles.center}>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Type to search products.
            </ThemedText>
          </View>
        ) : loading && products.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : error && products.length === 0 ? (
          <View style={styles.center}>
            <ThemedText style={styles.errorTitle}>Search failed</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {error}
            </ThemedText>
          </View>
        ) : (
          <ProductGrid
            products={products}
            onEndReached={onEndReached}
            loadingMore={loadingMore}
            emptyMessage={`No results for "${debounced}".`}
            ListHeaderComponent={
              <SortBar
                value={sort}
                onChange={setSort}
                resultCount={meta?.total}
              />
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  searchRow: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: Spacing.two,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.two,
  },
  clear: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  centerText: { fontSize: 13, textAlign: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '700' },
});
