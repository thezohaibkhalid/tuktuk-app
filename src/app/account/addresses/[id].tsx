import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AddressForm } from '@/components/checkout/AddressForm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import {
  listAddresses,
  updateAddress,
  type Address,
  type AddressInput,
} from '@/services/addresses';

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const numericId = Number(id);

  const [initial, setInitial] = useState<AddressInput | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] =
    useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (!numericId) return;
    let cancelled = false;
    listAddresses()
      .then((list) => {
        if (cancelled) return;
        const match = list.find((a: Address) => a.id === numericId);
        if (!match) {
          setInitial(null);
          return;
        }
        const { id: _id, isDefaultBilling, isDefaultShipping, ...rest } = match;
        void _id;
        void isDefaultBilling;
        void isDefaultShipping;
        setInitial(rest);
      })
      .catch(() => {
        if (!cancelled) setInitial(null);
      });
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  const onSubmit = async (input: AddressInput) => {
    setLoading(true);
    setServerError(null);
    setServerFieldErrors(null);
    try {
      await updateAddress(numericId, input);
      router.back();
    } catch (e) {
      if (e instanceof ApiError) {
        setServerError(e.message);
        setServerFieldErrors(e.fields ?? null);
      } else {
        setServerError('Failed to update address');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initial === undefined) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: 'Edit address' }} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (initial === null) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: 'Edit address' }} />
        <View style={styles.center}>
          <ThemedText style={styles.errorTitle}>Address not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Edit address' }} />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <AddressForm
            initial={initial}
            submitLabel="Save changes"
            onSubmit={onSubmit}
            loading={loading}
            serverError={serverError}
            serverFieldErrors={serverFieldErrors}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  errorTitle: { fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
});
