import { apiFetch } from './api';

export type ProductRating = { average: number; total: number };

export type ProductMedia = {
  type: 'image' | 'video';
  url: string;
  card?: string;
  sm?: string;
  md?: string;
  lg?: string;
  poster?: string;
};

export type ProductSpec = { label: string; value: string };

export type ProductReview = {
  id: number;
  customer: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  createdAt: string;
  verified: boolean;
};

export type VariantOption = { name: string; values: string[] };

export type ProductVariant = {
  id: number;
  sku: string;
  options: Record<string, string>;
  price?: number;
  salePrice?: number;
  stock: number;
  image?: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  isNew?: boolean;
  isSaleable: boolean;
  rating?: ProductRating;
  tags?: string[];
  sku?: string;
  brand?: string;
  stock?: number;
  shortDescription?: string;
  description?: string;
  descriptionHtml?: string;
  gallery?: string[];
  media?: ProductMedia[];
  specs?: ProductSpec[];
  reviews?: ProductReview[];
  variantOptions?: VariantOption[];
  variants?: ProductVariant[];
  badges?: { name: string; color: string; slug: string }[];
  breadcrumbs?: { name: string; slug: string }[];
  allowCod?: boolean;
};

export type ProductSearchParams = {
  q?: string;
  keywords?: string[];
  sort?: 'popularity' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  brand?: string[];
  inStock?: boolean;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  perPage?: number;
};

export type ProductSearchResult = {
  data: Product[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export const DEFAULT_PRODUCTS_PER_PAGE = 24;

export type ProductCarouselSection = {
  id: string;
  title: string;
  viewAllHref: string;
  products: Product[];
};

export type ProductFilter = 'featured' | 'for-her';

export const getProductBySlug = (slug: string) =>
  apiFetch<Product | null>(`/products/${slug}`);

export const getFeaturedProducts = () =>
  apiFetch<Product[]>('/products?filter=featured&perPage=10');

export const getProductsSection = (filter: ProductFilter) =>
  apiFetch<ProductCarouselSection>(`/products?filter=${filter}&perPage=10`);

export const getProductsByIds = (ids: string[]) =>
  apiFetch<Product[]>(`/products/batch?ids=${ids.join(',')}`);

export const getCollectionProducts = (slug: string, limit = 10) =>
  apiFetch<Product[]>(`/collections/${slug}/products?limit=${limit}`);

export const getRelatedProducts = (slug: string, limit = 10) =>
  apiFetch<Product[]>(`/products/${slug}/related?limit=${limit}`);

export const getCategoryProducts = (
  categorySlug: string,
  subSlug?: string,
  page = 1,
  perPage = DEFAULT_PRODUCTS_PER_PAGE,
) => {
  const path = subSlug
    ? `/categories/${categorySlug}/sub/${subSlug}/products`
    : `/categories/${categorySlug}/products`;
  return apiFetch<ProductSearchResult>(
    `${path}?page=${page}&perPage=${perPage}`,
  );
};

const buildSearchQuery = (params: ProductSearchParams): string => {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.keywords?.length) qs.set('keywords', params.keywords.join(','));
  if (params.sort) qs.set('sort', params.sort);
  if (params.brand?.length) qs.set('brand', params.brand.join(','));
  if (params.inStock !== undefined) qs.set('inStock', String(params.inStock));
  if (params.onSale !== undefined) qs.set('onSale', String(params.onSale));
  if (params.minPrice !== undefined)
    qs.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined)
    qs.set('maxPrice', String(params.maxPrice));
  if (params.minRating !== undefined)
    qs.set('minRating', String(params.minRating));
  qs.set('page', String(params.page ?? 1));
  qs.set('perPage', String(params.perPage ?? DEFAULT_PRODUCTS_PER_PAGE));
  return qs.toString();
};

export const searchProducts = (params: ProductSearchParams) =>
  apiFetch<ProductSearchResult>(`/products/search?${buildSearchQuery(params)}`);
