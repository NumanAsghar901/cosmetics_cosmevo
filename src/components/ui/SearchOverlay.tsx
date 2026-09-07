'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useModal } from '@/context/ModalContext';
import { BUNDLED_PRODUCTS } from '@/lib/products';
import { fmtPrice, getCategoryLabel, getToneFor } from '@/lib/utils';
import ProductArt from './ProductArt';

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useModal();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = query.trim()
    ? BUNDLED_PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.family.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.concerns.some((c) => c.toLowerCase().includes(q))
        );
      })
    : BUNDLED_PRODUCTS;

  return (
    <div
      role="dialog"
      aria-label="Search products"
      className="fixed inset-0 z-[65] bg-ink/50 backdrop-blur-sm flex items-start justify-center p-5 pt-20 animate-fadeIn"
      onClick={closeSearch}
    >
      <div
        className="bg-warm-white w-full max-w-[560px] rounded-[20px] overflow-hidden shadow-soft max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-5 border-b border-border-subtle bg-warm-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.6" y2="16.6" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, e.g. Acne, Hair, Giga…"
            className="flex-1 border-none bg-transparent text-base text-ink outline-none placeholder:text-text-secondary/60"
          />
          <button
            type="button"
            data-cursor="Close"
            aria-label="Close search"
            onClick={closeSearch}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream text-ink transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4 text-text-secondary text-sm">
              No products found for &ldquo;{query}&rdquo;. Try another term.
            </div>
          ) : (
            filtered.map((p) => {
              const tone = getToneFor(p.category);
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={closeSearch}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-cream transition-colors group"
                >
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden">
                    <ProductArt
                      tone={tone}
                      imageUrl={p.image_url ? p.image_url.split(',')[0].trim() : undefined}
                      enableTilt={false}
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink group-hover:text-plum transition-colors truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {p.family} · {getCategoryLabel(p.category)}
                    </div>
                  </div>
                  <span className="text-[13.5px] font-extrabold text-ink ml-auto shrink-0">
                    {fmtPrice(p.price)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
