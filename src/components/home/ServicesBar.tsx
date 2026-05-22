import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SERVICES = [
  { title: 'Free Delivery', subtitle: 'Orders above Rs 5,000' },
  { title: 'Cash on Delivery', subtitle: 'Pay when you receive' },
  { title: 'Easy Returns', subtitle: '7-day return policy' },
  { title: 'Secure Checkout', subtitle: 'SSL encrypted' },
];

export function ServicesBar() {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: theme.surfaceSoft, borderColor: theme.borderLight },
      ]}>
      {SERVICES.map((s) => (
        <View key={s.title} style={styles.item}>
          <ThemedText style={[styles.title, { color: theme.secondary }]}>
            {s.title}
          </ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {s.subtitle}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing.four,
    marginHorizontal: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  item: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
});
