import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(isDisabled), busy: Boolean(loading) }}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.btn,
        { backgroundColor: isDisabled ? theme.border : theme.primary },
      ]}>
      {loading ? (
        <ActivityIndicator color={theme.secondary} />
      ) : (
        <ThemedText style={[styles.text, { color: theme.secondary }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  text: { fontSize: 15, fontWeight: '800' },
});
