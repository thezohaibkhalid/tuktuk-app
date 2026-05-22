import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { Notice } from '@/components/Notice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth';
import {
  selectCartCodAllowed,
  selectCartSavings,
  selectCartSubtotal,
  useCartStore,
  type CartLine,
} from '@/stores/cart';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore(selectCartSubtotal);
  const savings = useCartStore(selectCartSavings);
  const codAllowed = useCartStore(selectCartCodAllowed);
  const user = useAuthStore((s) => s.user);

  const onCheckout = () => {
    if (!user) {
      router.push('/auth/login' as never);
      return;
    }
    router.push('/checkout' as never);
  };

  const confirmClear = () => {
    Alert.alert('Clear cart?', 'All items will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clear() },
    ]);
  };

  if (lines.length === 0) {
    return (
      <ThemedView style={styles.fill}>
        <SafeAreaView edges={['top']} style={styles.fill}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Cart</ThemedText>
          </View>
          <View style={styles.empty}>
            <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyBody}>
              Browse products and tap Add to cart to get started.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/' as never)}
              style={[styles.emptyCta, { backgroundColor: theme.primary }]}>
              <ThemedText style={[styles.emptyCtaText, { color: theme.secondary }]}>
                Start shopping
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const renderLine = ({ item }: { item: CartLine }) => {
    const showStrike = item.originalPrice > item.unitPrice;
    const lineTotal = item.unitPrice * item.quantity;
    const maxReached =
      item.stock !== undefined && item.stock > 0 && item.quantity >= item.stock;

    return (
      <View
        style={[
          styles.line,
          { backgroundColor: theme.surface, borderColor: theme.borderLight },
        ]}>
        <Pressable
          onPress={() => router.push(`/p/${item.slug}` as never)}
          style={styles.imageWrap}>
          <Image
            source={{ uri: item.image }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
          />
        </Pressable>
        <View style={styles.lineBody}>
          <Pressable onPress={() => router.push(`/p/${item.slug}` as never)}>
            {item.brand ? (
              <ThemedText style={styles.brand} themeColor="textSecondary">
                {item.brand}
              </ThemedText>
            ) : null}
            <ThemedText numberOfLines={2} style={styles.name}>
              {item.name}
            </ThemedText>
            {item.variantLabel ? (
              <ThemedText style={styles.variant} themeColor="textSecondary">
                {item.variantLabel}
              </ThemedText>
            ) : null}
            {item.isCustomized ? (
              <View
                style={[
                  styles.customizedChip,
                  { backgroundColor: theme.secondaryLight },
                ]}>
                <ThemedText
                  style={[styles.customizedChipText, { color: theme.secondary }]}>
                  Customized · made to order
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
          <View style={styles.lineFooter}>
            <View style={styles.priceCol}>
              <ThemedText style={[styles.linePrice, { color: theme.secondary }]}>
                {formatPKR(lineTotal)}
              </ThemedText>
              {showStrike ? (
                <ThemedText
                  style={[styles.strike, { color: theme.textLight }]}>
                  {formatPKR(item.originalPrice * item.quantity)}
                </ThemedText>
              ) : null}
            </View>
            <QuantityStepper
              value={item.quantity}
              onIncrement={() => increment(item.key)}
              onDecrement={() => decrement(item.key)}
              maxReached={maxReached}
            />
          </View>
          <Pressable onPress={() => remove(item.key)} hitSlop={6}>
            <ThemedText style={[styles.removeLink, { color: theme.danger }]}>
              Remove
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView edges={['top']} style={styles.fill}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Cart</ThemedText>
          <Pressable onPress={confirmClear} hitSlop={6}>
            <ThemedText style={[styles.clearLink, { color: theme.danger }]}>
              Clear
            </ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={lines}
          keyExtractor={(l) => l.key}
          renderItem={renderLine}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        />

        <View
          style={[
            styles.summary,
            { backgroundColor: theme.surface, borderTopColor: theme.borderLight },
          ]}>
          {!codAllowed ? (
            <Notice
              tone="warning"
              body="Cash on Delivery isn't available for this order because it contains a customized or pre-paid item."
            />
          ) : null}
          {savings > 0 ? (
            <View style={styles.summaryRow}>
              <ThemedText themeColor="textSecondary" style={styles.summaryLabel}>
                You save
              </ThemedText>
              <ThemedText style={[styles.savings, { color: theme.success }]}>
                {formatPKR(savings)}
              </ThemedText>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <ThemedText style={[styles.totalLabel, { color: theme.secondary }]}>
              Subtotal
            </ThemedText>
            <ThemedText style={[styles.total, { color: theme.secondary }]}>
              {formatPKR(subtotal)}
            </ThemedText>
          </View>
          <Pressable
            onPress={onCheckout}
            style={[styles.checkout, { backgroundColor: theme.primary }]}>
            <ThemedText style={[styles.checkoutText, { color: theme.secondary }]}>
              {user ? 'Checkout' : 'Sign in to checkout'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', flex: 1 },
  clearLink: { fontSize: 13, fontWeight: '600' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyBody: { fontSize: 13, textAlign: 'center' },
  emptyCta: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  emptyCtaText: { fontSize: 14, fontWeight: '800' },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  line: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  lineBody: { flex: 1, gap: 4 },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  variant: { fontSize: 11 },
  customizedChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  customizedChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  lineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceCol: { gap: 1 },
  linePrice: { fontSize: 15, fontWeight: '800' },
  strike: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  removeLink: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  summary: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 12 },
  savings: { fontSize: 13, fontWeight: '700' },
  totalLabel: { fontSize: 14, fontWeight: '700' },
  total: { fontSize: 20, fontWeight: '900' },
  checkout: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  checkoutText: { fontSize: 15, fontWeight: '800' },
});
