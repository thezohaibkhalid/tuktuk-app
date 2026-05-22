import { apiFetch } from './api';

export type SliderItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAltText?: string;
  buttonText: string;
  buttonLink: string;
  buttonBgColor: string;
  titleColor: string;
  descriptionColor: string;
  theme?: 'light' | 'dark';
};

export type PromoData = {
  id: number;
  text: string;
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
};

export type Keyword = { id: number; name: string; slug: string };

export type SubCategory = {
  id: number;
  name: string;
  slug: string;
  keywords?: Keyword[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string;
  showInNavbar: boolean;
  navOrder: number;
  isActive: boolean;
  parentId?: number;
  subCategories: SubCategory[];
};

export type CircleCategory = {
  id: number;
  name: string;
  slug: string;
  image: string;
  parentSlug?: string;
  href?: string;
};

export type ShowcaseCategory = {
  id: number;
  name: string;
  slug: string;
  image: string;
  badge?: string;
  description?: string;
  productCount?: number;
  discountPercent?: number;
};

export type ShowcaseFilter = 'category-of-the-day' | 'flash-sale';

export type CategoryShowcaseSection = {
  filter: ShowcaseFilter;
  title: string;
  subtitle: string;
  categories: ShowcaseCategory[];
};

export const getHomeSliders = () =>
  apiFetch<SliderItem[]>('/cms/hero-slides');

export const getPromoData = () => apiFetch<PromoData>('/cms/promo');

export const getCategories = () => apiFetch<Category[]>('/categories');

export const getCircleCategories = () =>
  apiFetch<CircleCategory[]>('/cms/circle-categories');

export const getCategoryShowcase = (filter: ShowcaseFilter) =>
  apiFetch<CategoryShowcaseSection>(`/cms/category-showcase/${filter}`);
