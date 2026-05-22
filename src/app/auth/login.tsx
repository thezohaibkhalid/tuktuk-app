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

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const fieldErrors = useAuthStore((s) => s.fieldErrors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    const ok = await login(email.trim(), password);
    if (ok) router.back();
  };

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Sign in' }} />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.title}>Welcome back</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Sign in to track orders, save addresses, and check out faster.
          </ThemedText>

          <View style={styles.form}>
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
              autoComplete="password"
              textContentType="password"
              error={fieldErrors?.password}
            />

            {error && !fieldErrors ? (
              <ThemedText style={[styles.formError, { color: theme.danger }]}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              label="Sign in"
              onPress={onSubmit}
              loading={loading}
              disabled={!email || !password}
            />

            <Link href={'/auth/forgot-password' as never} asChild>
              <Pressable hitSlop={6} style={styles.linkRow}>
                <ThemedText style={[styles.link, { color: theme.secondary }]}>
                  Forgot password?
                </ThemedText>
              </Pressable>
            </Link>
          </View>

          <View style={styles.footerRow}>
            <ThemedText themeColor="textSecondary" style={styles.footerText}>
              New to TukTuk?{' '}
            </ThemedText>
            <Link href={'/auth/register' as never} asChild>
              <Pressable hitSlop={6}>
                <ThemedText style={[styles.link, { color: theme.secondary }]}>
                  Create an account
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
  formError: { fontSize: 13, fontWeight: '600' },
  linkRow: { alignSelf: 'center', padding: 4 },
  link: { fontSize: 13, fontWeight: '700' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  footerText: { fontSize: 13 },
});
