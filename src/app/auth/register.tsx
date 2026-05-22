import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Field } from '@/components/form/Field';
import { PrimaryButton } from '@/components/form/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const fieldErrors = useAuthStore((s) => s.fieldErrors);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    const ok = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    });
    if (ok) router.back();
  };

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Create account' }} />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.title}>Create your account</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Track orders, save addresses, and pay faster on every visit.
          </ThemedText>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameCol}>
                <Field
                  label="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  textContentType="givenName"
                  error={fieldErrors?.firstName}
                />
              </View>
              <View style={styles.nameCol}>
                <Field
                  label="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  textContentType="familyName"
                  error={fieldErrors?.lastName}
                />
              </View>
            </View>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={fieldErrors?.email}
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              error={fieldErrors?.password}
            />

            {error && !fieldErrors ? (
              <ThemedText style={[styles.formError, { color: theme.danger }]}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              label="Create account"
              onPress={onSubmit}
              loading={loading}
              disabled={!firstName || !lastName || !email || !password}
            />
          </View>

          <View style={styles.footerRow}>
            <ThemedText themeColor="textSecondary" style={styles.footerText}>
              Already have an account?{' '}
            </ThemedText>
            <Link href={'/auth/login' as never} asChild>
              <Pressable hitSlop={6}>
                <ThemedText style={[styles.link, { color: theme.secondary }]}>
                  Sign in
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  form: { gap: Spacing.three, marginTop: Spacing.two },
  nameRow: { flexDirection: 'row', gap: Spacing.two },
  nameCol: { flex: 1 },
  formError: { fontSize: 13, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  footerText: { fontSize: 13 },
  link: { fontSize: 13, fontWeight: '700' },
});
