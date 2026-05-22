import { apiFetch } from './api';
import type { AddressInput } from './addresses';

export type CheckoutSettings = {
  shippingPrice: number;
  freeShippingThreshold: number;
  taxPercentage: number;
};

export type ShippingMethod = {
  code: string;
  title: string;
  description: string;
  price: number;
  etaDays: number;
};

export type PaymentMethod = {
  code: string;
  title: string;
  description: string;
  icon: string | null;
};

export type PlaceOrderItem = {
  productId: string;
  variantId: number | null;
  quantity: number;
  unitPrice: number;
};

export type PlaceOrderInput = {
  items: PlaceOrderItem[];
  shippingAddress: AddressInput;
  billingAddress: AddressInput;
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  note?: string;
};

export type PlaceOrderResponse = { orderNumber: string };

export const getCheckoutSettings = () =>
  apiFetch<CheckoutSettings>('/checkout/settings', { anonymous: true });

export const getShippingMethods = () =>
  apiFetch<ShippingMethod[]>('/checkout/methods/shipping', { anonymous: true });

export const getPaymentMethods = () =>
  apiFetch<PaymentMethod[]>('/checkout/methods/payment', { anonymous: true });

export const placeOrder = (input: PlaceOrderInput) =>
  apiFetch<PlaceOrderResponse>('/checkout/place-order', {
    method: 'POST',
    body: JSON.stringify(input),
  });

// Pricing helpers — applied client-side using settings + selected shipping.
export const computeTotals = (params: {
  subtotal: number;
  settings: CheckoutSettings | null;
  shippingMethod: ShippingMethod | null;
}) => {
  const { subtotal, settings, shippingMethod } = params;
  const freeThreshold = settings?.freeShippingThreshold ?? 0;
  const baseShipping =
    shippingMethod?.price ?? settings?.shippingPrice ?? 0;
  const shipping =
    freeThreshold > 0 && subtotal >= freeThreshold ? 0 : baseShipping;
  const taxPct = settings?.taxPercentage ?? 0;
  const tax = Math.round(subtotal * (taxPct / 100) * 100) / 100;
  const grandTotal = subtotal + shipping + tax;
  return { shipping, tax, grandTotal };
};
