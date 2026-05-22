import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Address } from '@/services/addresses';

export function AddressCard({
  address,
  selected,
  onPress,
}: {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.primary : theme.borderLight,
          borderWidth: selected ? 2 : 1,
        },
      ]}>
      <View style={styles.header}>
        <ThemedText style={styles.name}>
          {address.firstName} {address.lastName}
        </ThemedText>
        {address.isDefaultShipping ? (
          <View style={[styles.chip, { backgroundColor: theme.primaryLight }]}>
            <ThemedText style={[styles.chipText, { color: theme.secondary }]}>
              Default
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText themeColor="textSecondary" style={styles.line}>
        {address.street1}
        {address.street2 ? `, ${address.street2}` : ''}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.line}>
        {address.city}, {address.state} {address.postcode}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.line}>
        {address.country}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.line}>
        {address.phone}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 2,
  },
  name: { fontSize: 14, fontWeight: '700', flex: 1 },
  line: { fontSize: 12, lineHeight: 16 },
  chip: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  chipText: { fontSize: 10, fontWeight: '800' },
});
