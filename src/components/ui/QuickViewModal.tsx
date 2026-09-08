'use client';

import React from 'react';
import Link from 'next/link';
import { useModal } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';
import { fmtPrice, getToneFor, getWhatsAppUrl } from '@/lib/utils';
import ProductArt from './ProductArt';

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView } = useModal();
  const { addToCart, openCart } = useCart();

  if (!quickViewProduct) return null;

  const tone = getToneFor(quickViewProduct.category);
  const waLink = getWhatsAppUrl(`Hi Cosmevo, I have a question about ${quickViewProduct.name}.`);

  const handleAddToCart = () => {
    addToCart(quickViewProduct.id);
    closeQuickView();
    openCart();
  };

  return (
    <div
      role="dialog"
      aria-label="Product details"
      className="fixed inset-0 z-[65] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={closeQuickView}
    >
      <div
        className="bg-warm-white w-full max-w-[820px] rounded-[24px] overflow-hidden shadow-soft max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          data-cursor="Close"
          aria-label="Close details"
          onClick={closeQuickView}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-warm-white text-ink shadow-soft flex items-center justify-center z-10 hover:bg-cream transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Visual Column */}
          <div className="p-6 sm:p-8 bg-cream flex items-center justify-center">
            <div className="w-full max-w-[320px]">
              <ProductArt
                tone={tone}
                featured={quickViewProduct.featured}
                comingSoon={quickViewProduct.is_coming_soon}
                imageUrl={quickViewProduct.image_url ? quickViewProduct.image_url.split(',')[0].trim() : undefined}
                className="w-full"
              />
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold tracking-wider uppercase text-plum-muted">
                {quickViewProduct.family}
              </span>
              {quickViewProduct.is_coming_soon && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                  Coming Soon
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-ink mb-2 tracking-tight">
              {quickViewProduct.name}
            </h3>
            <p className="text-sm text-text-secondary mb-3 leading-relaxed">
              {quickViewProduct.tagline}
            </p>

            <div className="text-2xl font-extrabold text-ink mb-4">
              {fmtPrice(quickViewProduct.price)}
            </div>

            <p className="text-[13.5px] text-text-secondary leading-relaxed mb-4">
              {quickViewProduct.overview}
            </p>

            {/* Key Benefits */}
            {quickViewProduct.benefits && quickViewProduct.benefits.length > 0 && (
              <ul className="space-y-2 mb-6 text-sm text-text-secondary">
                {quickViewProduct.benefits.slice(0, 3).map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-plum mt-2 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 mt-auto pt-4 border-t border-border-subtle">
              {!quickViewProduct.is_coming_soon && (
                <button
                  type="button"
                  data-cursor="Add"
                  onClick={handleAddToCart}
                  className="btn btn-primary magnetic"
                >
                  Add to Cart
                </button>
              )}
              <Link
                href={`/product/${quickViewProduct.slug}`}
                onClick={closeQuickView}
                className="btn btn-secondary magnetic"
              >
                Full Details
              </Link>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary magnetic text-xs px-4"
              >
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
