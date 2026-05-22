import { Stack } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { ApiError } from '@/services/api';
import { forgotPassword } from '@/services/auth';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Reset password' }} />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <ThemedText style={styles.title}>Reset your password</ThemedText>

          {submitted ? (
            <View
              style={[
                styles.successBox,
                { backgroundColor: theme.successLight },
              ]}>
              <ThemedText style={[styles.successTitle, { color: theme.success }]}>
                Check your inbox
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.successBody}>
                If an account exists for that email, we&apos;ve sent a reset link.
                Follow the instructions to set a new password.
              </ThemedText>
            </View>
          ) : (
            <>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Enter the email associated with your account. We&apos;ll send a link to
                reset your password.
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
                />
                {error ? (
                  <ThemedText style={[styles.formError, { color: theme.danger }]}>
                    {error}
                  </ThemedText>
                ) : null}
                <PrimaryButton
                  label="Send reset link"
                  onPress={onSubmit}
                  loading={loading}
                  disabled={!email}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  form: { gap: Spacing.three, marginTop: Spacing.two },
  formError: { fontSize: 13, fontWeight: '600' },
  successBox: {
    padding: Spacing.three,
    borderRadius: 10,
    gap: 4,
  },
  successTitle: { fontSize: 14, fontWeight: '800' },
  successBody: { fontSize: 13, lineHeight: 18 },
});
