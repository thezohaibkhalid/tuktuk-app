import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type PersistStorage,
} from 'zustand/middleware';

import type { Product } from '@/services/products';

export type CartLine = {
  // Unique per (productId + variantId). One line per product+variant combo.
  key: string;
  productId: number;
  variantId?: number;
  slug: string;
  name: string;
  image: string;
  brand?: string;
  unitPrice: number;
  // Snapshotted at add-time. Source of truth for the displayed strike-through.
  originalPrice: number;
  quantity: number;
  // Soft cap based on stock at add-time. Server is authoritative on checkout.
  stock?: number;
  variantLabel?: string;
  // Snapshotted from the product at add-time. Used to gate Cash on Delivery
  // and to surface a "Customized" badge in cart/checkout.
  isCustomized?: boolean;
  allowCod?: boolean;
};

type AddInput = {
  product: Product;
  quantity?: number;
  variantId?: number;
  variantLabel?: string;
};

type CartState = {
  lines: CartLine[];
  hydrated: boolean;
  add: (input: AddInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const lineKey = (productId: number, variantId?: number) =>
  variantId ? `${productId}:v${variantId}` : `${productId}`;

const clampQuantity = (line: CartLine, next: number): number => {
  if (next < 1) return 1;
  if (line.stock !== undefined && line.stock > 0) {
    return Math.min(next, line.stock);
  }
  return next;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,

      add: ({ product, quantity = 1, variantId, variantLabel }) => {
        const key = lineKey(product.id, variantId);
        const variant = variantId
          ? product.variants?.find((v) => v.id === variantId)
          : undefined;
        const unitPrice =
          variant?.salePrice ??
          variant?.price ??
          product.salePrice ??
          product.price;
        const originalPrice = variant?.price ?? product.price;
        const stock = variant?.stock ?? product.stock;
        const image = variant?.image ?? product.image;

        set((state) => {
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            const nextQty = clampQuantity(existing, existing.quantity + quantity);
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: nextQty } : l,
              ),
            };
          }
          const newLine: CartLine = {
            key,
            productId: product.id,
            variantId,
            slug: product.slug,
            name: product.name,
            image,
            brand: product.brand,
            unitPrice,
            originalPrice,
            quantity: clampQuantity(
              { stock } as CartLine,
              quantity,
            ),
            stock,
            variantLabel,
            isCustomized: product.isCustomized,
            allowCod: product.allowCod,
          };
          return { lines: [...state.lines, newLine] };
        });
      },

      updateQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: clampQuantity(l, quantity) } : l,
          ),
        })),

      increment: (key) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: clampQuantity(l, l.quantity + 1) } : l,
          ),
        })),

      decrement: (key) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.key === key ? { ...l, quantity: l.quantity - 1 } : l,
            )
            .filter((l) => l.quantity > 0),
        })),

      remove: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: 'tuktuk-cart',
      storage: createJSONStorage(() => AsyncStorage) as PersistStorage<CartState>,
      partialize: (state) => ({ lines: state.lines }) as CartState,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

// Selectors — derive lazily to keep components subscribed minimally.
export const selectCartCount = (s: CartState) =>
  s.lines.reduce((acc, l) => acc + l.quantity, 0);

export const selectCartSubtotal = (s: CartState) =>
  s.lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);

export const selectCartSavings = (s: CartState) =>
  s.lines.reduce(
    (acc, l) => acc + Math.max(0, (l.originalPrice - l.unitPrice) * l.quantity),
    0,
  );

export const selectCartHasCustomized = (s: CartState) =>
  s.lines.some((l) => l.isCustomized === true);

// Reasons COD might not be allowed for the current cart. Empty array = COD is
// fine. The UI surfaces these as a human-readable explanation in checkout.
export type CodBlocker =
  | { kind: 'customized'; lineKeys: string[] }
  | { kind: 'product-restricted'; lineKeys: string[] };

export const selectCodBlockers = (s: CartState): CodBlocker[] => {
  const customized = s.lines
    .filter((l) => l.isCustomized === true)
    .map((l) => l.key);
  const restricted = s.lines
    .filter((l) => l.allowCod === false && l.isCustomized !== true)
    .map((l) => l.key);

  const blockers: CodBlocker[] = [];
  if (customized.length) blockers.push({ kind: 'customized', lineKeys: customized });
  if (restricted.length)
    blockers.push({ kind: 'product-restricted', lineKeys: restricted });
  return blockers;
};

export const selectCartCodAllowed = (s: CartState) =>
  selectCodBlockers(s).length === 0;
