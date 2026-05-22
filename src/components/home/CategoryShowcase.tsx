import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CategoryShowcaseSection } from '@/services/cms';

import { SectionShell } from './SectionShell';

const CARD_W = 140;
const CARD_H = 180;

export function CategoryShowcase({ showcase }: { showcase: CategoryShowcaseSection }) {
  const theme = useTheme();
  const router = useRouter();
  if (!showcase?.categories?.length) return null;

  return (
    <SectionShell title={showcase.title} subtitle={showcase.subtitle}>
      <FlatList
        data={showcase.categories}
        keyExtractor={(c) => `${c.id}-${c.slug}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.two }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/c/${item.slug}` as never)}>
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: item.image }}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
              {item.badge ? (
                <View style={[styles.badge, { backgroundColor: theme.sale }]}>
                  <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
                </View>
              ) : null}
              {item.discountPercent ? (
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[styles.badgeText, { color: theme.secondary }]}>
                    -{item.discountPercent}%
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.body}>
              <ThemedText numberOfLines={1} style={styles.name}>
                {item.name}
              </ThemedText>
              {item.description ? (
                <ThemedText
                  numberOfLines={1}
                  themeColor="textSecondary"
                  style={styles.desc}>
                  {item.description}
                </ThemedText>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  imageWrap: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#eee',
  },
  body: {
    padding: Spacing.two,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
  },
  desc: {
    fontSize: 11,
  },
  badge: {
    position: 'absolute',
    top: Spacing.one,
    left: Spacing.one,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
