import { apiFetch } from './api';
import {
  getCategories,
  getCategoryShowcase,
  getCircleCategories,
  getHomeSliders,
  getPromoData,
  type Category,
  type CategoryShowcaseSection,
  type CircleCategory,
  type PromoData,
  type ShowcaseFilter,
  type SliderItem,
} from './cms';
import {
  getCollectionProducts,
  getProductBySlug,
  getProductsByIds,
  getProductsSection,
  type Product,
  type ProductFilter,
} from './products';

export type ProductsSource =
  | { type: 'filter'; filter: ProductFilter }
  | { type: 'category'; categorySlug: string; subSlug?: string }
  | { type: 'collection'; collectionSlug: string }
  | { type: 'manual'; productIds: string[] };

export type ProductsGridSettings = {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  layout: 'grid' | 'carousel';
  source: ProductsSource;
  limit: number;
};

export type CategoryShowcaseSettings = {
  showcaseId?: number;
  title?: string;
  subtitle?: string;
  filter?: ShowcaseFilter;
  direction?: 'ltr' | 'rtl' | 'none';
  showArrows?: boolean;
  categories?: { categoryId: number; slug: string; name: string; image?: string }[];
  items?: {
    id?: number;
    categoryId?: number;
    type?: 'category' | 'collection';
    slug: string;
    name: string;
    image?: string;
  }[];
};

export type FeaturedProductSettings = {
  productSlug: string;
  headline?: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
};

export type HomeSection =
  | { id: string; type: 'hero_slider'; position: number; active: boolean }
  | { id: string; type: 'promo_banner'; position: number; active: boolean }
  | {
      id: string;
      type: 'circle_categories';
      position: number;
      active: boolean;
      settings?: CategoryShowcaseSettings;
    }
  | {
      id: string;
      type: 'products_grid';
      position: number;
      active: boolean;
      settings: ProductsGridSettings;
    }
  | {
      id: string;
      type: 'category_showcase';
      position: number;
      active: boolean;
      settings: CategoryShowcaseSettings;
    }
  | { id: string; type: 'services_bar'; position: number; active: boolean }
  | {
      id: string;
      type: 'featured_product';
      position: number;
      active: boolean;
      settings: FeaturedProductSettings;
    };

export type HomepageLayout = { sections: HomeSection[] };

export const getHomepageLayout = () =>
  apiFetch<HomepageLayout>('/cms/homepage-layout');

export const getActiveHomepageSections = async (): Promise<HomeSection[]> => {
  const layout = await getHomepageLayout();
  return (layout.sections ?? [])
    .filter((s) => s.active)
    .sort((a, b) => a.position - b.position);
};

export const resolveProductsForSection = async (
  settings: ProductsGridSettings,
): Promise<Product[]> => {
  const { source, limit } = settings;
  switch (source.type) {
    case 'filter': {
      const section = await getProductsSection(source.filter);
      return section.products.slice(0, limit);
    }
    case 'collection':
      return getCollectionProducts(source.collectionSlug, limit);
    case 'manual':
      return getProductsByIds(source.productIds);
    case 'category': {
      const path = source.subSlug
        ? `/categories/${source.categorySlug}/sub/${source.subSlug}/products?perPage=${limit}`
        : `/categories/${source.categorySlug}/products?perPage=${limit}`;
      const res = await apiFetch<{ data: Product[] } | Product[]>(path);
      return Array.isArray(res) ? res : res.data;
    }
  }
};

export type SectionData =
  | { kind: 'hero_slider'; data: SliderItem[] }
  | { kind: 'promo_banner'; data: PromoData }
  | { kind: 'circles'; data: CircleCategory[] }
  | { kind: 'showcase'; data: CategoryShowcaseSection }
  | { kind: 'products'; data: Product[] }
  | { kind: 'featured_product'; data: Product | null }
  | { kind: 'services_bar'; data: null };

export const fetchSectionData = async (
  section: HomeSection,
  enrichCategories?: Category[],
): Promise<SectionData> => {
  switch (section.type) {
    case 'hero_slider':
      return { kind: 'hero_slider', data: await getHomeSliders() };
    case 'promo_banner':
      return { kind: 'promo_banner', data: await getPromoData() };
    case 'circle_categories':
    case 'category_showcase': {
      const s = section.settings;
      const inlineItems = s?.items?.length
        ? s.items
        : s?.categories?.length
          ? s.categories
          : null;
      if (inlineItems) {
        const cats = enrichCategories ?? [];
        const enriched: CircleCategory[] = inlineItems.map((item) => {
          const isCollection =
            'type' in item && (item as { type?: string }).type === 'collection';
          const dbCat = !isCollection
            ? cats.find((c) => c.slug === item.slug)
            : undefined;
          const parentSlug = dbCat?.parentId
            ? cats.find((p) => p.id === dbCat.parentId)?.slug
            : undefined;
          return {
            id: (item as { id?: number; categoryId?: number }).id ??
              (item as { categoryId?: number }).categoryId ?? 0,
            name: item.name,
            slug: item.slug,
            image: item.image ?? dbCat?.image ?? '',
            parentSlug,
            href: isCollection ? `/collections/${item.slug}` : undefined,
          };
        });
        return { kind: 'circles', data: enriched };
      }
      if (s?.filter) {
        return { kind: 'showcase', data: await getCategoryShowcase(s.filter) };
      }
      return { kind: 'circles', data: await getCircleCategories() };
    }
    case 'products_grid':
      return {
        kind: 'products',
        data: await resolveProductsForSection(section.settings),
      };
    case 'featured_product': {
      if (!section.settings?.productSlug) {
        return { kind: 'featured_product', data: null };
      }
      try {
        return {
          kind: 'featured_product',
          data: await getProductBySlug(section.settings.productSlug),
        };
      } catch {
        return { kind: 'featured_product', data: null };
      }
    }
    case 'services_bar':
      return { kind: 'services_bar', data: null };
  }
};
