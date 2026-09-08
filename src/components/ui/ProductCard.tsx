'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { fmtPrice, getToneFor } from '@/lib/utils';
import ProductArt from './ProductArt';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';

function getFakeCardStats(productId: string | number) {
  const seed = typeof productId === 'string'
    ? productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : Number(productId);
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyOffset = daysSinceEpoch * 5;
  const reviewCount = 400 + ((seed * 3 + dailyOffset) % 1301); // 400-1700
  const avgRating = 4.4 + ((seed + dailyOffset) % 7) * 0.1; // 4.4 – 5.0
  return { reviewCount, avgRating: Math.min(5.0, avgRating) };
}

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
          comingSoon={product.is_coming_soon}
          showQuickAdd={!product.is_coming_soon}
          imageUrl={product.image_url ? product.image_url.split(',')[0].trim() : undefined}
          hoverImageUrl={product.image_url && product.image_url.includes(',') ? product.image_url.split(',')[1].trim() : undefined}
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
      <p className="text-[13.5px] text-text-secondary leading-[1.45] line-clamp-2 min-h-[38px] mb-2">
        {product.tagline}
      </p>

      {/* Mini star rating or Coming Soon pill */}
      {product.is_coming_soon ? (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Coming Soon · Preview Only
          </span>
        </div>
      ) : (
        (() => {
          const { reviewCount, avgRating } = getFakeCardStats(product.id);
          const fullStars = Math.round(avgRating);
          return (
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="11" height="11" viewBox="0 0 24 24"
                    fill={s <= fullStars ? '#6B21A8' : 'none'}
                    stroke={s <= fullStars ? '#6B21A8' : '#CBD5E1'}
                    strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-text-secondary font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-[11px] text-text-secondary">({reviewCount.toLocaleString()})</span>
            </div>
          );
        })()
      )}

      {/* Price and Actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-subtle">
        <span className="text-[15px] font-extrabold text-ink">{fmtPrice(product.price)}</span>
        
        {product.is_coming_soon ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
            >
              Preview
            </Link>
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
