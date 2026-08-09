
import React from 'react';
import type { RecommendedProduct } from '../../../types';
import { getAffiliateLinkProps } from '../../../utils/affiliateLinks';
import { ExternalLinkIcon, StarIcon } from '../Icons';

interface RecommendedProductCardProps {
  product: RecommendedProduct;
}

const RecommendedProductCard: React.FC<RecommendedProductCardProps> = ({ product }) => {
  // Built once per render from the product's affiliate config — always use this,
  // never link straight to `product.destinationUrl`.
  const linkProps = getAffiliateLinkProps(product);

  return (
    <div className="bg-[var(--background)] rounded-2xl p-4 border border-[var(--border)] flex flex-col group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full bg-[var(--secondary)] rounded-lg overflow-hidden mb-4">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute top-2 left-2 bg-[var(--primary)]/80 text-white text-xs font-bold px-2 py-1 rounded-full">
          {product.category}
        </span>
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
          Ad
        </span>
      </div>
      <div className="flex-grow">
        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">{product.brand} · {product.retailer}</p>
        <h3 className="font-bold text-[var(--foreground)] truncate mt-0.5">{product.name}</h3>
        {typeof product.rating === 'number' && (
          <div className="flex items-center gap-1 mt-1" aria-label={`Rated ${product.rating} out of 5`}>
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-semibold text-[var(--muted)]">{product.rating.toFixed(1)}</span>
          </div>
        )}
        <p className="text-sm text-[var(--muted)] mt-1 h-10 line-clamp-2">{product.description}</p>
      </div>
      <div className="flex items-center justify-between mt-4 gap-3">
        {product.price && (
          <p className="text-sm font-extrabold text-[var(--foreground)] whitespace-nowrap">{product.price}</p>
        )}
        <a
          {...linkProps}
          className="ml-auto bg-[var(--primary)] text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
        >
          Shop Now
          <ExternalLinkIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default RecommendedProductCard;
