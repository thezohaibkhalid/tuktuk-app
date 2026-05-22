import { CategoryShowcase } from './CategoryShowcase';
import { CircleCategories } from './CircleCategories';
import { FeaturedProduct } from './FeaturedProduct';
import { HeroSlider } from './HeroSlider';
import { ProductsSection } from './ProductsSection';
import { PromoBanner } from './PromoBanner';
import { ServicesBar } from './ServicesBar';

import type { HomeSection, SectionData } from '@/services/homepage';

export function SectionRenderer({
  section,
  data,
}: {
  section: HomeSection;
  data: SectionData;
}) {
  switch (section.type) {
    case 'hero_slider':
      if (data.kind !== 'hero_slider') return null;
      return <HeroSlider sliders={data.data} />;

    case 'promo_banner':
      if (data.kind !== 'promo_banner') return null;
      return <PromoBanner promo={data.data} />;

    case 'circle_categories':
    case 'category_showcase': {
      const settings =
        section.type === 'circle_categories'
          ? section.settings
          : section.settings;
      if (data.kind === 'showcase') {
        return <CategoryShowcase showcase={data.data} />;
      }
      if (data.kind === 'circles') {
        return (
          <CircleCategories
            title={settings?.title}
            subtitle={settings?.subtitle}
            categories={data.data}
          />
        );
      }
      return null;
    }

    case 'products_grid': {
      if (data.kind !== 'products') return null;
      return (
        <ProductsSection
          title={section.settings.title}
          subtitle={section.settings.subtitle}
          products={data.data}
          layout={section.settings.layout}
        />
      );
    }

    case 'featured_product': {
      if (data.kind !== 'featured_product' || !data.data) return null;
      return (
        <FeaturedProduct
          product={data.data}
          headline={section.settings.headline}
          subtitle={section.settings.subtitle}
          badgeText={section.settings.badgeText}
          ctaText={section.settings.ctaText}
        />
      );
    }

    case 'services_bar':
      return <ServicesBar />;
  }
}
