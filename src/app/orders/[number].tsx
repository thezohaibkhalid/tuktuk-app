import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import {
  getOrder,
  type OrderAddress,
  type OrderDetail,
  type OrderItem,
  type OrderTimelineEntry,
} from '@/services/orders';

const formatPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString('en-PK')}`;

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function OrderDetailScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const theme = useTheme();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!number) return;
    let cancelled = false;
    getOrder(number)
      .then((o) => !cancelled && setOrder(o))
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : 'Could not load order');
        setOrder(null);
      });
    return () => {
      cancelled = true;
    };
  }, [number]);

  if (order === undefined) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: number ? `#${number}` : 'Order' }} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </ThemedView>
    );
  }

  if (order === null) {
    return (
      <ThemedView style={styles.fill}>
        <Stack.Screen options={{ title: 'Order' }} />
        <View style={styles.center}>
          <ThemedText style={styles.errorTitle}>Order not found</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.errorBody}>
            {error ?? 'We couldn’t find this order on your account.'}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: `#${order.number}` }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.headerCard,
            { backgroundColor: theme.surface, borderColor: theme.borderLight },
          ]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText style={styles.headerNumber}>#{order.number}</ThemedText>
              {order.placedAt ? (
                <ThemedText themeColor="textSecondary" style={styles.headerDate}>
                  Placed {formatDateTime(order.placedAt)}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.badges}>
              <StatusBadge status={order.status} size="md" />
              <StatusBadge status={order.paymentStatus} size="sm" />
            </View>
          </View>
          {order.expectedDeliveryAt ? (
            <ThemedText themeColor="textSecondary" style={styles.eta}>
              Expected delivery: {formatDateTime(order.expectedDeliveryAt)}
            </ThemedText>
          ) : null}
          {order.cancelReason ? (
            <ThemedText style={[styles.cancelNote, { color: theme.danger }]}>
              Canceled: {order.cancelReason}
            </ThemedText>
          ) : null}
        </View>

        {order.trackingNumber ? (
          <Section title="Tracking">
            <View
              style={[
                styles.row,
                { backgroundColor: theme.surface, borderColor: theme.borderLight },
              ]}>
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText style={styles.rowTitle}>
                  {order.trackingCarrier ?? 'Carrier'}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.rowSubtitle}>
                  {order.trackingNumber}
                </ThemedText>
              </View>
              {order.trackingUrl ? (
                <Pressable
                  onPress={() => void WebBrowser.openBrowserAsync(order.trackingUrl!)}>
                  <ThemedText style={[styles.linkText, { color: theme.secondary }]}>
                    Track ›
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </Section>
        ) : null}

        <Section title={`Items (${order.itemsQty})`}>
          {order.items.map((item) => (
            <ItemRow key={item.id} item={item} onPressProduct={
              item.slug ? () => router.push(`/p/${item.slug}` as never) : undefined
            } />
          ))}
        </Section>

        <Section title="Delivery">
          <AddressBlock address={order.shippingAddress} method={order.shippingMethod} />
        </Section>

        <Section title="Payment">
          <View
            style={[
              styles.row,
              { backgroundColor: theme.surface, borderColor: theme.borderLight },
            ]}>
            <ThemedText style={styles.rowTitle}>{order.paymentMethod}</ThemedText>
            <StatusBadge status={order.paymentStatus} size="sm" />
          </View>
        </Section>

        {order.timeline?.length ? (
          <Section title="Timeline">
            <View
              style={[
                styles.timelineWrap,
                { backgroundColor: theme.surface, borderColor: theme.borderLight },
              ]}>
              {order.timeline.map((entry, i) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isLast={i === order.timeline.length - 1}
                />
              ))}
            </View>
          </Section>
        ) : null}

        <View
          style={[
            styles.totalsBox,
            { backgroundColor: theme.surface, borderColor: theme.borderLight },
          ]}>
          <TotalsRow label="Subtotal" value={formatPKR(order.subtotal)} />
          {order.discount > 0 ? (
            <TotalsRow label="Discount" value={`-${formatPKR(order.discount)}`} />
          ) : null}
          <TotalsRow
            label="Shipping"
            value={order.shipping === 0 ? 'Free' : formatPKR(order.shipping)}
          />
          {order.tax > 0 ? (
            <TotalsRow label="Tax" value={formatPKR(order.tax)} />
          ) : null}
          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
          <TotalsRow label="Total" value={formatPKR(order.grandTotal)} bold />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ItemRow({
  item,
  onPressProduct,
}: {
  item: OrderItem;
  onPressProduct?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPressProduct}
      style={[
        styles.itemRow,
        { backgroundColor: theme.surface, borderColor: theme.borderLight },
      ]}>
      <View style={styles.itemThumb}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </View>
      <View style={styles.itemBody}>
        <ThemedText numberOfLines={2} style={styles.itemName}>
          {item.name}
        </ThemedText>
        {item.variantLabel ? (
          <ThemedText themeColor="textSecondary" style={styles.itemMeta}>
            {item.variantLabel}
          </ThemedText>
        ) : null}
        <ThemedText themeColor="textSecondary" style={styles.itemMeta}>
          Qty {item.quantity} · {formatPKR(item.unitPrice)}
        </ThemedText>
      </View>
      <ThemedText style={[styles.itemTotal, { color: theme.secondary }]}>
        {formatPKR(item.lineTotal)}
      </ThemedText>
    </Pressable>
  );
}

function AddressBlock({
  address,
  method,
}: {
  address: OrderAddress;
  method?: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.addressBlock,
        { backgroundColor: theme.surface, borderColor: theme.borderLight },
      ]}>
      {method ? (
        <ThemedText themeColor="textSecondary" style={styles.addressMethod}>
          {method}
        </ThemedText>
      ) : null}
      <ThemedText style={styles.addressName}>
        {address.firstName} {address.lastName}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.addressLine}>
        {address.street1}
        {address.street2 ? `, ${address.street2}` : ''}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.addressLine}>
        {address.city}, {address.state} {address.postcode}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.addressLine}>
        {address.country}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.addressLine}>
        {address.phone}
      </ThemedText>
    </View>
  );
}

function TimelineEntry({
  entry,
  isLast,
}: {
  entry: OrderTimelineEntry;
  isLast: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlSpine}>
        <View style={[styles.tlDot, { backgroundColor: theme.primary }]} />
        {!isLast ? (
          <View style={[styles.tlLine, { backgroundColor: theme.borderLight }]} />
        ) : null}
      </View>
      <View style={styles.tlBody}>
        <ThemedText style={styles.tlLabel}>{entry.label}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.tlTime}>
          {formatDateTime(entry.occurredAt)}
        </ThemedText>
        {entry.note ? (
          <ThemedText themeColor="textSecondary" style={styles.tlNote}>
            {entry.note}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  errorTitle: { fontSize: 16, fontWeight: '700' },
  errorBody: { fontSize: 13, textAlign: 'center' },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  headerCard: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  headerNumber: { fontSize: 18, fontWeight: '800' },
  headerDate: { fontSize: 12 },
  badges: { alignItems: 'flex-end', gap: 4 },
  eta: { fontSize: 12 },
  cancelNote: { fontSize: 12, fontWeight: '600' },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  sectionBody: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSubtitle: { fontSize: 12 },
  linkText: { fontSize: 13, fontWeight: '700' },
  itemRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  itemBody: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemMeta: { fontSize: 11 },
  itemTotal: { fontSize: 14, fontWeight: '800' },
  addressBlock: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  addressMethod: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressName: { fontSize: 14, fontWeight: '700' },
  addressLine: { fontSize: 12, lineHeight: 16 },
  timelineWrap: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.two,
  },
  tlRow: { flexDirection: 'row', gap: Spacing.two },
  tlSpine: { alignItems: 'center', width: 10 },
  tlDot: { width: 10, height: 10, borderRadius: Radius.pill, marginTop: 4 },
  tlLine: { width: 2, flex: 1, marginTop: 2 },
  tlBody: { flex: 1, paddingBottom: Spacing.two, gap: 2 },
  tlLabel: { fontSize: 13, fontWeight: '700' },
  tlTime: { fontSize: 11 },
  tlNote: { fontSize: 12, lineHeight: 16, marginTop: 2 },
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
});
