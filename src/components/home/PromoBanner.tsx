import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PromoData } from '@/services/cms';

export function PromoBanner({ promo }: { promo: PromoData | null }) {
  const theme = useTheme();
  if (!promo?.text) return null;

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.primaryLight }]}>
      <View style={styles.row}>
        <ThemedText style={[styles.text, { color: theme.secondary }]} numberOfLines={2}>
          {promo.text}
        </ThemedText>
        {promo.showButton && promo.buttonText ? (
          <Pressable
            style={[styles.cta, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel={promo.buttonText}>
            <ThemedText style={[styles.ctaText, { color: theme.secondary }]}>
              {promo.buttonText}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  cta: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
