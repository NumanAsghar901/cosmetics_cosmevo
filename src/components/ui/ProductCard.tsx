'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { fmtPrice, getToneFor } from '@/lib/utils';
import ProductArt from './ProductArt';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { openQuickView } = useModal();
  const [isAdded, setIsAdded] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, addBtnRef.current);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickView(product);
  };

  const tone = getToneFor(product.category);

  return (
    <div className="product-card group flex flex-col transition-transform duration-300 ease-cosmevo hover:-translate-y-1">
      {/* Visual Header */}
      <div
        onClick={handleQuickView}
        className="cursor-pointer mb-4"
        role="button"
        tabIndex={0}
        aria-label={`Quick view ${product.name}`}
      >
        <ProductArt
          tone={tone}
          featured={product.featured}
          showQuickAdd={true}
          imageUrl={product.image_url}
          cursorLabel="View"
        />
      </div>

      {/* Meta & Title */}
      <span className="text-[11px] font-bold tracking-wider uppercase text-plum-muted mb-1.5">
        {product.family}
      </span>
      <Link
        href={`/product/${product.slug}`}
        className="text-base font-bold tracking-tight text-ink hover:text-plum transition-colors line-clamp-1 mb-1"
      >
        {product.name}
      </Link>
      <p className="text-[13.5px] text-text-secondary leading-[1.45] line-clamp-2 min-h-[38px] mb-3">
        {product.tagline}
      </p>

      {/* Price and Actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle">
        <span className="text-[15px] font-extrabold text-ink">{fmtPrice(product.price)}</span>
        <div className="flex items-center gap-2">
          <button
            ref={addBtnRef}
            type="button"
            data-cursor="Add"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAdd}
            className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
              isAdded
                ? 'bg-plum text-white'
                : 'bg-cream text-ink hover:bg-plum hover:text-white'
            }`}
          >
            {isAdded ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>

          <button
            type="button"
            data-cursor="View"
            aria-label={`Quick view ${product.name}`}
            onClick={handleQuickView}
            className="w-[38px] h-[38px] rounded-full bg-cream text-ink hover:bg-plum hover:text-white flex items-center justify-center transition-all duration-200 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
