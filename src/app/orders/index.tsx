import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { listOrders, type OrderSummary } from '@/services/orders';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function OrdersListScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await listOrders();
      setOrders(res.data);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Could not load your orders',
      );
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (orders === null) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: 'Your orders' }} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Your orders' }} />
      <FlatList
        data={orders}
        keyExtractor={(o) => o.number}
        contentContainerStyle={[styles.listContent, orders.length === 0 && styles.fill]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={styles.emptyTitle}>No orders yet</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyBody}>
              {error ?? 'Once you place an order, you’ll see it here.'}
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/orders/${item.number}` as never)}
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.borderLight },
            ]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <ThemedText style={styles.cardNumber}>
                  #{item.number}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.cardDate}>
                  {formatDate(item.placedAt)}
                </ThemedText>
              </View>
              <StatusBadge status={item.status} size="md" />
            </View>
            <View style={styles.cardFooter}>
              <ThemedText themeColor="textSecondary" style={styles.cardFooterLabel}>
                {item.itemsQty} {item.itemsQty === 1 ? 'item' : 'items'}
              </ThemedText>
              <ThemedText style={[styles.cardTotal, { color: theme.secondary }]}>
                {formatPKR(item.grandTotal)}
              </ThemedText>
            </View>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: Spacing.three, gap: Spacing.two },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyBody: { fontSize: 13, textAlign: 'center' },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardHeaderText: { gap: 2 },
  cardNumber: { fontSize: 14, fontWeight: '800' },
  cardDate: { fontSize: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardFooterLabel: { fontSize: 12 },
  cardTotal: { fontSize: 15, fontWeight: '800' },
});
