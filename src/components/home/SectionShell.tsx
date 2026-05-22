import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  paddingHorizontal?: number;
}>;

export function SectionShell({ title, subtitle, paddingHorizontal = Spacing.three, children }: Props) {
  return (
    <View style={styles.wrapper}>
      {(title || subtitle) && (
        <View style={[styles.header, { paddingHorizontal }]}>
          {title ? (
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
          ) : null}
          {subtitle ? (
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.half,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
