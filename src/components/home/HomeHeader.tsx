import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function HomeHeader() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.wrapper, { backgroundColor: theme.surface }]}>
      <View style={styles.row}>
        <ThemedText style={[styles.brand, { color: theme.secondary }]}>
          TukTuk
        </ThemedText>
        <Pressable
          onPress={() => router.push('/search' as never)}
          style={[
            styles.searchBar,
            { backgroundColor: theme.surfaceSoft, borderColor: theme.borderLight },
          ]}>
          <ThemedText style={styles.searchPlaceholder} themeColor="textLight">
            Search products...
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brand: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  searchBar: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  searchPlaceholder: {
    fontSize: 13,
  },
});
