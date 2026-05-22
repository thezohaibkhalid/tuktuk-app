import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { AddressForm } from '@/components/checkout/AddressForm';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ApiError } from '@/services/api';
import { createAddress, type AddressInput } from '@/services/addresses';

export default function NewAccountAddressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] =
    useState<Record<string, string> | null>(null);

  const onSubmit = async (input: AddressInput) => {
    setLoading(true);
    setServerError(null);
    setServerFieldErrors(null);
    try {
      await createAddress(input);
      router.back();
    } catch (e) {
      if (e instanceof ApiError) {
        setServerError(e.message);
        setServerFieldErrors(e.fields ?? null);
      } else {
        setServerError('Failed to save address');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'New address' }} />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <AddressForm
            submitLabel="Save address"
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
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
});
