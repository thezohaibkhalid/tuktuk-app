import { apiFetch } from './api';
import type { Address } from './addresses';

export type OrderSummary = {
  id: string;
  number: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  currency: string;
  itemsQty: number;
  placedAt: string;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
};

export type OrderItem = {
  id: number;
  productId: number | null;
  variantId: number | null;
  sku: string;
  variantSku?: string | null;
  variantLabel?: string | null;
  variantOptions?: Record<string, string>;
  name: string;
  image: string | null;
  slug: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  lineTotal: number;
};

export type OrderTimelineEntry = {
  id: number;
  status: string;
  label: string;
  note: string | null;
  occurredAt: string;
};

export type OrderAddress = Omit<Address, 'isDefaultBilling' | 'isDefaultShipping'>;

export type OrderDetail = {
  id: string;
  number: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  shippingMethod: string;
  paymentMethod: string;
  couponCode?: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  currency: string;
  itemsQty: number;
  placedAt: string;
  processedAt?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  canceledAt?: string | null;
  cancelReason?: string | null;
  expectedDeliveryAt?: string | null;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
  trackingUrl?: string | null;
  notes?: string | null;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
};

export type OrdersListResponse = {
  data: OrderSummary[];
  meta: { page: number; perPage: number; total: number };
};

export const listOrders = (page = 1, perPage = 20) =>
  apiFetch<OrdersListResponse>(`/customer/orders?page=${page}&perPage=${perPage}`);

export const getOrder = (number: string) =>
  apiFetch<OrderDetail>(`/customer/orders/${number}`);

// Status helpers used by UI badges. Backend statuses are lowercase strings
// like "pending", "processing", "shipped", "delivered", "canceled". Unknown
// values fall through to the neutral default.
export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const orderStatusTone = (status: string): StatusTone => {
  const s = status.toLowerCase();
  if (s === 'delivered' || s === 'completed' || s === 'paid') return 'success';
  if (s === 'shipped' || s === 'processing' || s === 'confirmed') return 'info';
  if (s === 'pending' || s === 'on_hold') return 'warning';
  if (s === 'canceled' || s === 'cancelled' || s === 'refunded' || s === 'failed')
    return 'danger';
  return 'neutral';
};

export const formatStatus = (status: string): string =>
  status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
