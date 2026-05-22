import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { SectionRenderer } from '@/components/home/SectionRenderer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCategories, type Category } from '@/services/cms';
import {
  fetchSectionData,
  getActiveHomepageSections,
  type HomeSection,
  type SectionData,
} from '@/services/homepage';

type Renderable = { section: HomeSection; data: SectionData };

export default function HomeScreen() {
  const theme = useTheme();
  const [renderable, setRenderable] = useState<Renderable[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [sections, cats]: [HomeSection[], Category[]] = await Promise.all([
        getActiveHomepageSections(),
        getCategories().catch(() => [] as Category[]),
      ]);
      const resolved: Renderable[] = await Promise.all(
        sections.map(async (section) => ({
          section,
          data: await fetchSectionData(section, cats),
        })),
      );
      setRenderable(resolved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load homepage');
      setRenderable([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={['top']} style={styles.fill}>
        <HomeHeader />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }>
          {renderable === null ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : error && renderable.length === 0 ? (
            <View style={styles.center}>
              <ThemedText style={styles.errorTitle}>
                Couldn&apos;t load the home page
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.errorBody}>
                {error}
              </ThemedText>
              <ThemedText themeColor="textLight" style={styles.errorHint}>
                Check that the backend is running and that your API URL is
                reachable from this device.
              </ThemedText>
            </View>
          ) : (
            renderable.map(({ section, data }) => (
              <SectionRenderer key={section.id} section={section} data={data} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  center: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 13,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
