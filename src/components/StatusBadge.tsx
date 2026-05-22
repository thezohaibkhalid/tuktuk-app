import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  formatStatus,
  orderStatusTone,
  type StatusTone,
} from '@/services/orders';

const toneColors = (theme: ReturnType<typeof useTheme>, tone: StatusTone) => {
  switch (tone) {
    case 'success':
      return { bg: theme.successLight, fg: theme.success };
    case 'info':
      return { bg: theme.secondaryLight, fg: theme.secondary };
    case 'warning':
      return { bg: theme.warningLight, fg: theme.warning };
    case 'danger':
      return { bg: theme.dangerLight, fg: theme.danger };
    case 'neutral':
    default:
      return { bg: theme.surfaceSoft, fg: theme.textSecondary };
  }
};

export function StatusBadge({
  status,
  tone,
  size = 'sm',
}: {
  status: string;
  tone?: StatusTone;
  size?: 'sm' | 'md';
}) {
  const theme = useTheme();
  const colors = toneColors(theme, tone ?? orderStatusTone(status));
  return (
    <View style={[styles.chip, size === 'md' && styles.chipMd, { backgroundColor: colors.bg }]}>
      <ThemedText
        style={[
          styles.text,
          size === 'md' && styles.textMd,
          { color: colors.fg },
        ]}>
        {formatStatus(status)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  chipMd: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  textMd: {
    fontSize: 12,
  },
});
