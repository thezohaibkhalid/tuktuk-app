import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Product } from '@/services/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLS = 2;
const GUTTER = Spacing.two;
const CARD_W = Math.floor(
  (SCREEN_WIDTH - Spacing.three * 2 - GUTTER * (COLS - 1)) / COLS,
);

type Props = {
  products: Product[];
  onEndReached?: () => void;
  loadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<unknown> | React.ReactElement | null;
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  onEndReached,
  loadingMore,
  refreshing,
  onRefresh,
  ListHeaderComponent,
  emptyMessage = 'No products found.',
}: Props) {
  const theme = useTheme();

  const renderItem = ({ item }: ListRenderItemInfo<Product>) => (
    <View style={{ width: CARD_W }}>
      <ProductCard product={item} width={CARD_W} />
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => String(p.id)}
      numColumns={COLS}
      columnWrapperStyle={{ gap: GUTTER, paddingHorizontal: Spacing.three }}
      contentContainerStyle={{
        gap: GUTTER,
        paddingBottom: Spacing.six,
        flexGrow: 1,
      }}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <View style={styles.empty}>
          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            {emptyMessage}
          </ThemedText>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : null
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.six,
  },
  emptyText: { fontSize: 13, textAlign: 'center' },
  footer: { paddingVertical: Spacing.three, alignItems: 'center' },
});
