import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { orderNumber } = useLocalSearchParams<{ orderNumber?: string }>();

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen
        options={{
          title: 'Order placed',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <SafeAreaView edges={['bottom']} style={styles.fill}>
        <View style={styles.content}>
          <View style={[styles.checkCircle, { backgroundColor: theme.successLight }]}>
            <ThemedText style={[styles.check, { color: theme.success }]}>✓</ThemedText>
          </View>
          <ThemedText style={styles.title}>Thank you for your order</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            We&apos;ve received your order and will start preparing it shortly.
            You&apos;ll get an update by email and in the app.
          </ThemedText>

          {orderNumber ? (
            <View
              style={[
                styles.orderBox,
                { backgroundColor: theme.surface, borderColor: theme.borderLight },
              ]}>
              <ThemedText themeColor="textSecondary" style={styles.orderLabel}>
                Order number
              </ThemedText>
              <ThemedText style={styles.orderNumber}>{orderNumber}</ThemedText>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.replace('/' as never)}
              style={[styles.primary, { backgroundColor: theme.primary }]}>
              <ThemedText style={[styles.primaryText, { color: theme.secondary }]}>
                Continue shopping
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/account' as never)}
              style={[styles.ghost, { borderColor: theme.border }]}>
              <ThemedText style={styles.ghostText}>View account</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  check: { fontSize: 38, fontWeight: '800', lineHeight: 42 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  orderBox: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
    marginTop: Spacing.three,
  },
  orderLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  orderNumber: { fontSize: 18, fontWeight: '800' },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    marginTop: 'auto',
  },
  primary: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  primaryText: { fontSize: 15, fontWeight: '800' },
  ghost: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  ghostText: { fontSize: 14, fontWeight: '700' },
});
