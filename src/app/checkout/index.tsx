import { Image } from 'expo-image';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddressCard } from '@/components/checkout/AddressCard';
import { OptionRow } from '@/components/checkout/OptionRow';
import { PrimaryButton } from '@/components/form/PrimaryButton';
import { Notice } from '@/components/Notice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { listAddresses, type Address } from '@/services/addresses';
import {
  computeTotals,
  getCheckoutSettings,
  getPaymentMethods,
  getShippingMethods,
  placeOrder,
  type CheckoutSettings,
  type PaymentMethod,
  type ShippingMethod,
} from '@/services/checkout';
import { useAuthStore } from '@/stores/auth';
import {
  selectCartSubtotal,
  selectCodBlockers,
  useCartStore,
  type CartLine,
  type CodBlocker,
} from '@/stores/cart';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore(selectCartSubtotal);
  const codBlockers = useCartStore(selectCodBlockers);
  const codAllowed = codBlockers.length === 0;
  const clearCart = useCartStore((s) => s.clear);

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingCode, setShippingCode] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedOut = hydrated && !user;
  const cartEmpty = lines.length === 0;

  useEffect(() => {
    if (isLoggedOut) router.replace('/auth/login' as never);
  }, [isLoggedOut, router]);

  useEffect(() => {
    if (hydrated && cartEmpty) router.replace('/cart' as never);
  }, [hydrated, cartEmpty, router]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [addrs, cfg, ship, pay] = await Promise.all([
        listAddresses().catch(() => [] as Address[]),
        getCheckoutSettings().catch(() => null),
        getShippingMethods().catch(() => [] as ShippingMethod[]),
        getPaymentMethods().catch(() => [] as PaymentMethod[]),
      ]);
      setAddresses(addrs);
      setSettings(cfg);
      setShippingMethods(ship);
      setPaymentMethods(pay);
      const defaultAddr =
        addrs.find((a) => a.isDefaultShipping) ?? addrs[0] ?? null;
      setSelectedAddressId((curr) => curr ?? defaultAddr?.id ?? null);
      setShippingCode((curr) => curr ?? ship[0]?.code ?? null);
      // Initial payment selection is handled by a separate effect that
      // accounts for COD eligibility (which depends on cart contents).
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // Reload addresses when returning from the New Address screen.
  useFocusEffect(
    useCallback(() => {
      if (user) {
        listAddresses()
          .then((addrs) => {
            setAddresses(addrs);
            setSelectedAddressId((curr) => {
              if (curr && addrs.some((a) => a.id === curr)) return curr;
              return (
                addrs.find((a) => a.isDefaultShipping)?.id ??
                addrs[0]?.id ??
                null
              );
            });
          })
          .catch(() => {
            // ignore — keep existing
          });
      }
    }, [user]),
  );

  const selectedAddress = useMemo(
    () => addresses?.find((a) => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );
  const selectedShipping = useMemo(
    () => shippingMethods.find((s) => s.code === shippingCode) ?? null,
    [shippingMethods, shippingCode],
  );

  // Payment methods the user is actually allowed to pick — COD removed when
  // the cart can't take it (customized / pre-paid items).
  const eligiblePaymentMethods = useMemo(
    () =>
      codAllowed
        ? paymentMethods
        : paymentMethods.filter((p) => p.code.toLowerCase() !== 'cod'),
    [paymentMethods, codAllowed],
  );

  // Keep the selected payment code in sync with eligibility. Two cases:
  //  1. Nothing selected yet -> pick the first eligible.
  //  2. Current selection became ineligible (cart changed) -> switch to first.
  useEffect(() => {
    if (eligiblePaymentMethods.length === 0) {
      if (paymentCode !== null) setPaymentCode(null);
      return;
    }
    const stillValid = eligiblePaymentMethods.some(
      (p) => p.code === paymentCode,
    );
    if (!paymentCode || !stillValid) {
      setPaymentCode(eligiblePaymentMethods[0].code);
    }
  }, [eligiblePaymentMethods, paymentCode]);

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        settings,
        shippingMethod: selectedShipping,
      }),
    [subtotal, settings, selectedShipping],
  );

  const canPlace =
    !placing && !!selectedAddress && !!shippingCode && !!paymentCode;

  const onPlaceOrder = async () => {
    if (!selectedAddress || !shippingCode || !paymentCode) return;
    setPlacing(true);
    setError(null);
    try {
      const { id: _ignored, isDefaultBilling, isDefaultShipping, ...addrInput } =
        selectedAddress as Address & Record<string, unknown>;
      void _ignored;
      void isDefaultBilling;
      void isDefaultShipping;

      const res = await placeOrder({
        items: lines.map((l) => ({
          productId: String(l.productId),
          variantId: l.variantId ?? null,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
        shippingAddress: addrInput,
        billingAddress: addrInput,
        paymentMethod: paymentCode,
        shippingMethod: shippingCode,
        subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        grandTotal: totals.grandTotal,
      });
      clearCart();
      router.replace({
        pathname: '/checkout/success',
        params: { orderNumber: res.orderNumber },
      } as never);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Could not place order. Please try again.',
      );
    } finally {
      setPlacing(false);
    }
  };

  if (!hydrated || (user && loading)) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (!user) return null;

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: 'Checkout' }} />
      <SafeAreaView edges={['bottom']} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Section title="Delivery address">
            {addresses && addresses.length > 0 ? (
              <View style={styles.list}>
                {addresses.map((a) => (
                  <AddressCard
                    key={a.id}
                    address={a}
                    selected={a.id === selectedAddressId}
                    onPress={() => setSelectedAddressId(a.id)}
                  />
                ))}
              </View>
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.emptyHint}>
                No addresses on file. Add one to continue.
              </ThemedText>
            )}
            <Pressable
              onPress={() => router.push('/checkout/address' as never)}
              style={[styles.addBtn, { borderColor: theme.primary }]}>
              <ThemedText style={[styles.addBtnText, { color: theme.secondary }]}>
                + Add new address
              </ThemedText>
            </Pressable>
          </Section>

          <Section title="Shipping method">
            {shippingMethods.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyHint}>
                No shipping methods available.
              </ThemedText>
            ) : (
              <View style={styles.list}>
                {shippingMethods.map((s) => (
                  <OptionRow
                    key={s.code}
                    title={s.title}
                    subtitle={
                      s.etaDays
                        ? `${s.description} · ${s.etaDays} days`
                        : s.description
                    }
                    trailing={s.price === 0 ? 'Free' : formatPKR(s.price)}
                    selected={s.code === shippingCode}
                    onPress={() => setShippingCode(s.code)}
                  />
                ))}
              </View>
            )}
          </Section>

          <Section title="Payment method">
            {!codAllowed ? (
              <Notice
                tone="warning"
                body={codBlockerMessage(codBlockers)}
              />
            ) : null}
            {eligiblePaymentMethods.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyHint}>
                No payment methods available for this order.
              </ThemedText>
            ) : (
              <View style={styles.list}>
                {eligiblePaymentMethods.map((p) => (
                  <OptionRow
                    key={p.code}
                    title={p.title}
                    subtitle={p.description}
                    selected={p.code === paymentCode}
                    onPress={() => setPaymentCode(p.code)}
                  />
                ))}
              </View>
            )}
          </Section>

          <Section title={`Order summary (${lines.length})`}>
            <View style={styles.list}>
              {lines.map((l) => (
                <SummaryLine key={l.key} line={l} />
              ))}
            </View>
          </Section>

          <View
            style={[
              styles.totalsBox,
              { backgroundColor: theme.surface, borderColor: theme.borderLight },
            ]}>
            <TotalsRow label="Subtotal" value={formatPKR(subtotal)} />
            <TotalsRow
              label="Shipping"
              value={totals.shipping === 0 ? 'Free' : formatPKR(totals.shipping)}
            />
            {totals.tax > 0 ? (
              <TotalsRow label="Tax" value={formatPKR(totals.tax)} />
            ) : null}
            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
            <TotalsRow
              label="Total"
              value={formatPKR(totals.grandTotal)}
              bold
            />
          </View>

          {error ? (
            <ThemedText style={[styles.error, { color: theme.danger }]}>
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { backgroundColor: theme.surface, borderTopColor: theme.borderLight },
          ]}>
          <PrimaryButton
            label={`Place order · ${formatPKR(totals.grandTotal)}`}
            onPress={onPlaceOrder}
            loading={placing}
            disabled={!canPlace}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

function SummaryLine({ line }: { line: CartLine }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.summaryLine,
        { backgroundColor: theme.surface, borderColor: theme.borderLight },
      ]}>
      <View style={styles.summaryThumb}>
        <Image
          source={{ uri: line.image }}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.summaryBody}>
        <ThemedText numberOfLines={2} style={styles.summaryName}>
          {line.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.summaryQty}>
          Qty {line.quantity}
        </ThemedText>
        {line.isCustomized ? (
          <View
            style={[
              styles.summaryChip,
              { backgroundColor: theme.secondaryLight },
            ]}>
            <ThemedText
              style={[styles.summaryChipText, { color: theme.secondary }]}>
              Customized
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText style={styles.summaryPrice}>
        {formatPKR(line.unitPrice * line.quantity)}
      </ThemedText>
    </View>
  );
}

function codBlockerMessage(blockers: CodBlocker[]): string {
  const customized = blockers.some((b) => b.kind === 'customized');
  const restricted = blockers.some((b) => b.kind === 'product-restricted');
  if (customized && restricted) {
    return 'Cash on Delivery isn’t available — this order contains a customized item and another item that requires prepayment.';
  }
  if (customized) {
    return 'Cash on Delivery isn’t available for customized (made-to-order) items. Please choose another payment method.';
  }
  return 'Cash on Delivery isn’t available for one or more items in this order. Please choose another payment method.';
}

function TotalsRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.totalsRow}>
      <ThemedText
        style={[styles.totalsLabel, bold && styles.totalsLabelBold]}
        themeColor={bold ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.totalsValue, bold && styles.totalsValueBold]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  list: { gap: Spacing.two },
  emptyHint: { fontSize: 12 },
  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 13, fontWeight: '800' },
  totalsBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsLabel: { fontSize: 13 },
  totalsLabelBold: { fontSize: 15, fontWeight: '800' },
  totalsValue: { fontSize: 13, fontWeight: '600' },
  totalsValueBold: { fontSize: 17, fontWeight: '900' },
  divider: { height: 1, marginVertical: 4 },
  summaryLine: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  summaryBody: { flex: 1, gap: 2 },
  summaryName: { fontSize: 12, fontWeight: '600' },
  summaryQty: { fontSize: 11 },
  summaryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 2,
  },
  summaryChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  summaryPrice: { fontSize: 13, fontWeight: '700' },
  error: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    borderTopWidth: 1,
  },
});
