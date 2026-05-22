import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function OptionRow({
  title,
  subtitle,
  trailing,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.primary : theme.borderLight,
          borderWidth: selected ? 2 : 1,
        },
      ]}>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? theme.primary : theme.border },
        ]}>
        {selected ? (
          <View
            style={[styles.radioInner, { backgroundColor: theme.primary }]}
          />
        ) : null}
      </View>
      <View style={styles.body}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailing ? (
        <ThemedText style={[styles.trailing, { color: theme.secondary }]}>
          {trailing}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '700' },
  subtitle: { fontSize: 12, lineHeight: 16 },
  trailing: { fontSize: 14, fontWeight: '800' },
});
