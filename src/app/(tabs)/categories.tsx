import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, type Category } from '@/services/cms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLS = 3;
const GUTTER = Spacing.two;
const TILE_W = Math.floor(
  (SCREEN_WIDTH - Spacing.three * 2 - GUTTER * (COLS - 1)) / COLS,
);

export default function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [cats, setCats] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((data) => {
        if (cancelled) return;
        const active = (data ?? []).filter((c) => c.isActive !== false);
        setCats(active);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load categories');
        setCats([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={['top']} style={styles.fill}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Categories</ThemedText>
        </View>
        {cats === null ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : cats.length === 0 ? (
          <View style={styles.center}>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {error ?? 'No categories yet.'}
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.grid}>
              {cats.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.tile,
                    { backgroundColor: theme.surface, borderColor: theme.borderLight },
                  ]}
                  onPress={() => router.push(`/c/${c.slug}` as never)}>
                  <View style={styles.tileImageWrap}>
                    {c.image ? (
                      <Image
                        source={{ uri: c.image }}
                        contentFit="cover"
                        style={StyleSheet.absoluteFill}
                      />
                    ) : (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      />
                    )}
                  </View>
                  <ThemedText
                    style={styles.tileLabel}
                    numberOfLines={2}>
                    {c.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  centerText: { fontSize: 13, textAlign: 'center' },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  grid: {
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GUTTER,
  },
  tile: {
    width: TILE_W,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: Spacing.two,
  },
  tileImageWrap: {
    width: '100%',
    height: TILE_W,
    backgroundColor: '#f1f5f9',
  },
  tileLabel: {
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.one,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 15,
  },
});
