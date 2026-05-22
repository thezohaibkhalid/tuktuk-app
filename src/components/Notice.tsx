import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type NoticeTone = 'info' | 'warning' | 'success' | 'danger';

const toneStyles = (
  theme: ReturnType<typeof useTheme>,
  tone: NoticeTone,
) => {
  switch (tone) {
    case 'success':
      return { bg: theme.successLight, fg: theme.success, border: theme.success };
    case 'warning':
      return { bg: theme.warningLight, fg: theme.warning, border: theme.warning };
    case 'danger':
      return { bg: theme.dangerLight, fg: theme.danger, border: theme.danger };
    case 'info':
    default:
      return {
        bg: theme.secondaryLight,
        fg: theme.secondary,
        border: theme.secondary,
      };
  }
};

export function Notice({
  tone = 'info',
  title,
  body,
}: {
  tone?: NoticeTone;
  title?: string;
  body: string;
}) {
  const theme = useTheme();
  const colors = toneStyles(theme, tone);
  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.bg, borderLeftColor: colors.border },
      ]}>
      {title ? (
        <ThemedText style={[styles.title, { color: colors.fg }]}>
          {title}
        </ThemedText>
      ) : null}
      <ThemedText style={[styles.body, { color: colors.fg }]}>{body}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    gap: 2,
  },
  title: { fontSize: 12, fontWeight: '800' },
  body: { fontSize: 12, lineHeight: 17 },
});
