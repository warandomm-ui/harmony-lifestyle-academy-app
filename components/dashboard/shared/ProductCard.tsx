
import React from 'react';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] flex flex-col group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full bg-[var(--secondary)] rounded-lg overflow-hidden mb-4">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute top-2 left-2 bg-[var(--primary)]/80 text-white text-xs font-bold px-2 py-1 rounded-full">{product.category}</span>
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-[var(--foreground)] truncate">{product.name}</h3>
        <p className="text-sm text-[var(--muted)] mt-1 h-10 line-clamp-2">{product.description}</p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-lg font-extrabold text-[var(--foreground)]">RM {product.price.toFixed(2)}</p>
        <button
          onClick={() => onAddToCart(product)}
          className="bg-[var(--primary)] text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-transform hover:scale-105"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
