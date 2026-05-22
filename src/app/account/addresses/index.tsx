import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import {
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  type Address,
} from '@/services/addresses';

export default function AddressesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listAddresses();
      setAddresses(data);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Could not load your addresses',
      );
      setAddresses([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onDelete = (a: Address) => {
    Alert.alert(
      'Delete address?',
      `Remove ${a.firstName} ${a.lastName} — ${a.street1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(a.id);
              await load();
            } catch (e) {
              Alert.alert(
                'Could not delete',
                e instanceof ApiError ? e.message : 'Try again later.',
              );
            }
          },
        },
      ],
    );
  };

  const onSetDefault = async (a: Address) => {
    try {
      await setDefaultAddress(a.id, 'shipping');
      await load();
    } catch (e) {
      Alert.alert(
        'Could not update',
        e instanceof ApiError ? e.message : 'Try again later.',
      );
    }
  };

  if (addresses === null) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: 'Addresses' }} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Addresses' }} />
      <FlatList
        data={addresses}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={[
          styles.listContent,
          addresses.length === 0 && styles.fill,
        ]}
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
            <ThemedText style={styles.emptyTitle}>No addresses yet</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyBody}>
              {error ?? 'Add a delivery address to speed up checkout.'}
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          <Pressable
            onPress={() => router.push('/account/addresses/new' as never)}
            style={[
              styles.addBtn,
              { borderColor: theme.primary, marginTop: addresses.length > 0 ? Spacing.three : 0 },
            ]}>
            <ThemedText style={[styles.addBtnText, { color: theme.secondary }]}>
              + Add new address
            </ThemedText>
          </Pressable>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.borderLight },
            ]}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.name}>
                {item.firstName} {item.lastName}
              </ThemedText>
              {item.isDefaultShipping ? (
                <View
                  style={[styles.chip, { backgroundColor: theme.primaryLight }]}>
                  <ThemedText
                    style={[styles.chipText, { color: theme.secondary }]}>
                    Default
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText themeColor="textSecondary" style={styles.line}>
              {item.street1}
              {item.street2 ? `, ${item.street2}` : ''}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.line}>
              {item.city}, {item.state} {item.postcode}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.line}>
              {item.country} · {item.phone}
            </ThemedText>

            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  router.push(`/account/addresses/${item.id}` as never)
                }>
                <ThemedText style={[styles.action, { color: theme.secondary }]}>
                  Edit
                </ThemedText>
              </Pressable>
              {!item.isDefaultShipping ? (
                <Pressable onPress={() => onSetDefault(item)}>
                  <ThemedText style={[styles.action, { color: theme.secondary }]}>
                    Make default
                  </ThemedText>
                </Pressable>
              ) : null}
              <Pressable onPress={() => onDelete(item)}>
                <ThemedText style={[styles.action, { color: theme.danger }]}>
                  Delete
                </ThemedText>
              </Pressable>
            </View>
          </View>
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
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 2,
  },
  name: { fontSize: 14, fontWeight: '700', flex: 1 },
  line: { fontSize: 12, lineHeight: 16 },
  chip: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  chipText: { fontSize: 10, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  action: { fontSize: 13, fontWeight: '700' },
  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 13, fontWeight: '800' },
});
