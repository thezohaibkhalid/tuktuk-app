import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Field } from '@/components/form/Field';
import { PrimaryButton } from '@/components/form/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { emptyAddress, type AddressInput } from '@/services/addresses';

type Errors = Partial<Record<keyof AddressInput, string>>;

function validate(input: AddressInput): Errors {
  const errs: Errors = {};
  if (!input.firstName.trim()) errs.firstName = 'Required';
  if (!input.lastName.trim()) errs.lastName = 'Required';
  if (!input.street1.trim()) errs.street1 = 'Required';
  if (!input.city.trim()) errs.city = 'Required';
  if (!input.state.trim()) errs.state = 'Required';
  if (!input.country.trim()) errs.country = 'Required';
  if (!input.phone.trim()) errs.phone = 'Required';
  return errs;
}

export function AddressForm({
  initial,
  submitLabel,
  onSubmit,
  loading,
  serverError,
  serverFieldErrors,
}: {
  initial?: AddressInput;
  submitLabel: string;
  onSubmit: (input: AddressInput) => void | Promise<void>;
  loading?: boolean;
  serverError?: string | null;
  serverFieldErrors?: Record<string, string> | null;
}) {
  const theme = useTheme();
  const [form, setForm] = useState<AddressInput>(initial ?? emptyAddress());
  const [errors, setErrors] = useState<Errors>({});

  const update =
    <K extends keyof AddressInput>(field: K) =>
    (value: AddressInput[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const onPress = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      await onSubmit(form);
    }
  };

  const err = (k: keyof AddressInput) =>
    errors[k] ?? serverFieldErrors?.[k];

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Field
            label="First name"
            value={form.firstName}
            onChangeText={update('firstName')}
            autoCapitalize="words"
            textContentType="givenName"
            error={err('firstName')}
          />
        </View>
        <View style={styles.col}>
          <Field
            label="Last name"
            value={form.lastName}
            onChangeText={update('lastName')}
            autoCapitalize="words"
            textContentType="familyName"
            error={err('lastName')}
          />
        </View>
      </View>

      <Field
        label="Phone"
        value={form.phone}
        onChangeText={update('phone')}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        error={err('phone')}
      />

      <Field
        label="Street address"
        value={form.street1}
        onChangeText={update('street1')}
        autoCapitalize="words"
        textContentType="streetAddressLine1"
        error={err('street1')}
      />

      <Field
        label="Apartment, suite, etc. (optional)"
        value={form.street2}
        onChangeText={update('street2')}
        autoCapitalize="words"
        textContentType="streetAddressLine2"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Field
            label="City"
            value={form.city}
            onChangeText={update('city')}
            autoCapitalize="words"
            textContentType="addressCity"
            error={err('city')}
          />
        </View>
        <View style={styles.col}>
          <Field
            label="Province"
            value={form.state}
            onChangeText={update('state')}
            autoCapitalize="words"
            textContentType="addressState"
            error={err('state')}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Field
            label="Postal code"
            value={form.postcode}
            onChangeText={update('postcode')}
            keyboardType="number-pad"
            textContentType="postalCode"
          />
        </View>
        <View style={styles.col}>
          <Field
            label="Country"
            value={form.country}
            onChangeText={update('country')}
            autoCapitalize="words"
            textContentType="countryName"
            error={err('country')}
          />
        </View>
      </View>

      <Field
        label="Company (optional)"
        value={form.company}
        onChangeText={update('company')}
        autoCapitalize="words"
      />

      {serverError && !serverFieldErrors ? (
        <ThemedText style={[styles.serverError, { color: theme.danger }]}>
          {serverError}
        </ThemedText>
      ) : null}

      <PrimaryButton label={submitLabel} onPress={onPress} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.two },
  col: { flex: 1 },
  serverError: { fontSize: 13, fontWeight: '600' },
});
