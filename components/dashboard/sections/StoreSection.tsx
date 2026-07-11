
import React, { useState, useMemo } from 'react';
import { ShoppingCartIcon } from '../Icons';
import { MOCK_PRODUCTS } from '../../../constants';
import ProductCard from '../shared/ProductCard';
import type { Product } from '../../../types';

type Category = Product['category'] | 'All';

interface StoreSectionProps {
  onAddToCart: (product: Product) => void;
}

const StoreSection: React.FC<StoreSectionProps> = ({ onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const categories: Category[] = ['All', 'Study Template', 'Merch', 'E-Book', 'Digital Tool', 'Physical Product'];

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') {
      return MOCK_PRODUCTS;
    }
    return MOCK_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <ShoppingCartIcon className="h-7 w-7 text-[var(--primary)]" />
        Harmony Store
      </h2>
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
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
};

export default StoreSection;
