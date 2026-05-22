import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export const Field = forwardRef<TextInput, Props>(function Field(
  { label, error, style, ...rest },
  ref,
) {
  const theme = useTheme();
  const borderColor = error ? theme.danger : theme.border;

  return (
    <View style={styles.wrapper}>
      <ThemedText style={[styles.label, { color: theme.secondary }]}>
        {label}
      </ThemedText>
      <TextInput
        ref={ref}
        placeholderTextColor={theme.textLight}
        {...rest}
        style={[
          styles.input,
          { borderColor, color: theme.text, backgroundColor: theme.surface },
          style,
        ]}
      />
      {error ? (
        <ThemedText style={[styles.error, { color: theme.danger }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { fontSize: 12, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  error: { fontSize: 11, fontWeight: '600' },
});
