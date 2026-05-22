import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CircleCategory } from '@/services/cms';

import { SectionShell } from './SectionShell';

const TILE = 72;

export function CircleCategories({
  title,
  subtitle,
  categories,
}: {
  title?: string;
  subtitle?: string;
  categories: CircleCategory[];
}) {
  const theme = useTheme();
  const router = useRouter();
  if (!categories?.length) return null;

  return (
    <SectionShell title={title} subtitle={subtitle}>
      <FlatList
        data={categories}
        keyExtractor={(c) => `${c.id}-${c.slug}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.tile}
            accessibilityRole="button"
            onPress={() => router.push((item.href ?? `/c/${item.slug}`) as never)}>
            <View style={[styles.circle, { borderColor: theme.primaryBorder }]}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  contentFit="cover"
                  style={styles.image}
                />
              ) : (
                <View
                  style={[styles.image, { backgroundColor: theme.primaryLight }]}
                />
              )}
            </View>
            <ThemedText
              numberOfLines={2}
              style={styles.label}
              themeColor="text">
              {item.name}
            </ThemedText>
          </Pressable>
        )}
      />
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE,
    alignItems: 'center',
    gap: Spacing.one,
  },
  circle: {
    width: TILE,
    height: TILE,
    borderRadius: Radius.pill,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
