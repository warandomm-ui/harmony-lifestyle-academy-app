
import React, { useState, useMemo } from 'react';
import { TagIcon } from '../Icons';
import { MOCK_RECOMMENDED_PRODUCTS } from '../../../constants';
import RecommendedProductCard from '../shared/RecommendedProductCard';
import type { RecommendedProduct } from '../../../types';

type Category = RecommendedProduct['category'] | 'All';

const RecommendedProductsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const categories: Category[] = useMemo(
    () => ['All', ...Array.from(new Set(MOCK_RECOMMENDED_PRODUCTS.map(p => p.category)))],
    []
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return MOCK_RECOMMENDED_PRODUCTS;
    return MOCK_RECOMMENDED_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1 flex items-center gap-2">
        <TagIcon className="h-7 w-7 text-[var(--primary)]" />
        Recommended For You
      </h2>
      <p className="text-xs text-[var(--muted)] mb-4">
        Handpicked products from trusted partners to support your studies, fitness, and wellbeing. Harmony Lifestyle
        Academy may earn a commission from qualifying purchases made through these links — at no extra cost to you.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${activeCategory === category
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--secondary)]/50 text-[var(--foreground)] hover:bg-[var(--secondary)]'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <RecommendedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProductsSection;
