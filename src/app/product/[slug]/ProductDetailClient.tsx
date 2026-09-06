'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { fmtPrice, getCategoryLabel, getToneFor, getWhatsAppUrl } from '@/lib/utils';
import ProductArt from '@/components/ui/ProductArt';
import ProductCard from '@/components/ui/ProductCard';
import ReviewsSection from '@/components/ui/ReviewsSection';
import { useCart } from '@/context/CartContext';

// Deterministic fake stats: base seeded by product.id, grows by +5 each day
function getFakeStats(productId: string | number) {
  const seed = typeof productId === 'string'
    ? productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : Number(productId);
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  
  const dailyOffset = daysSinceEpoch * 5;
  const sold = 400 + ((seed + dailyOffset) % 1301); // Strictly 400-1700
  const reviewCount = 400 + ((seed * 3 + dailyOffset) % 1301); // Strictly 400-1700
  
  return { sold, reviewCount };
}

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'how' | 'caution'>('benefits');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainBtnRef = useRef<HTMLButtonElement>(null);
  const { addToCart, openCart } = useCart();
  const router = useRouter();

  const tone = getToneFor(product.category);
  const waUrl = getWhatsAppUrl(`Hi Cosmevo, I'm interested in ordering ${product.name}. Could you share more details?`);

  const handleAddToCart = (open = true) => {
    for (let i = 0; i < qty; i++) {
      addToCart(product.id, mainBtnRef.current);
    }
    if (open) openCart();
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push('/checkout');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!mainBtnRef.current) return;
      const rect = mainBtnRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-plum transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-plum transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-plum transition-colors">
            {getCategoryLabel(product.category)}
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* PDP Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Visual Gallery Left */}
          <div className="w-full max-w-[500px] mx-auto lg:max-w-none">
            <div className="bg-cream rounded-[24px] p-6 sm:p-10 shadow-xs">
              <ProductArt
                tone={tone}
                featured={product.featured}
                imageUrl={product.image_url}
                className="w-full max-w-[420px] mx-auto shadow-sm"
              />
            </div>
          </div>

          {/* Product Details Right */}
          <div className="flex flex-col">
            <span className="eyebrow !mb-2">{product.family}</span>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-ink tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-base text-text-secondary mt-3 leading-relaxed">
              {product.tagline}
            </p>

            {/* Fake Stats: Reviews & Sold */}
            {(() => {
              const { sold, reviewCount } = getFakeStats(product.id);
              const avgRating = 4.5 + ((typeof product.id === 'string' ? product.id.charCodeAt(0) : Number(product.id)) % 6) * 0.1;
              return (
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                          fill={s <= Math.round(avgRating) ? '#6B21A8' : 'none'}
                          stroke={s <= Math.round(avgRating) ? '#6B21A8' : '#CBD5E1'}
                          strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-ink">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-text-secondary">({reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span><b className="text-ink">{sold.toLocaleString()}+</b> sold</span>
                  </div>
                </div>
              );
            })()}

            {/* Price */}
            <div className="text-3xl font-extrabold text-ink mt-5 mb-6">
              {fmtPrice(product.price)}
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-3 bg-cream rounded-full px-3 py-1.5">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-full bg-warm-white flex items-center justify-center font-extrabold text-sm text-ink hover:bg-plum hover:text-white transition-colors"
                >
                  –
                </button>
                <span className="font-bold text-sm min-w-[24px] text-center text-ink">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((prev) => prev + 1)}
                  className="w-7 h-7 rounded-full bg-warm-white flex items-center justify-center font-extrabold text-sm text-ink hover:bg-plum hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3.5 mb-6">
              <button
                ref={mainBtnRef}
                type="button"
                data-cursor="Add"
                onClick={() => handleAddToCart(true)}
                className="btn btn-primary magnetic flex-1 min-w-[180px]"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="btn btn-secondary magnetic flex-1 min-w-[160px] border-plum text-plum hover:bg-plum/5"
              >
                Buy Now
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Chat"
                className="btn btn-secondary magnetic"
              >
                Ask on WhatsApp
              </a>
            </div>

            {/* Trust Assurances */}
            <div className="border-t border-border-subtle pt-5 space-y-2.5 text-xs sm:text-sm text-text-secondary">
              <div className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-plum shrink-0">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span><b>Fast Delivery:</b> 3–5 working days nationwide across Pakistan.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-plum shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><b>Free Shipping:</b> Automatically applied on orders above Rs. 2,000.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-plum shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span><b>7-Day Eligible Returns:</b> Unopened items in original packaging.</span>
              </div>
            </div>

            {/* Accordion Tabs for Detailed Info */}
            <div className="mt-8 border-t border-border-subtle divide-y divide-border-subtle">
              {/* Overview */}
              <div className="py-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-ink mb-2">Overview</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{product.overview}</p>
              </div>

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="py-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-ink mb-2.5">Key Benefits</h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-plum mt-2 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to Use */}
              {product.how_to_use && product.how_to_use.length > 0 && (
                <div className="py-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-ink mb-2.5">How to Use</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-text-secondary">
                    {product.how_to_use.map((step, i) => (
                      <li key={i} className="leading-relaxed pl-1">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Caution */}
              {product.caution && (
                <div className="py-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-ink mb-1.5">Caution</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">{product.caution}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border-subtle">
            <div className="mb-8">
              <span className="eyebrow">Complementary Care</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div
        id="stickyBar"
        className={`lg:hidden fixed left-0 right-0 bottom-0 bg-warm-white border-t border-border-subtle shadow-lg p-3.5 px-6 flex items-center justify-between gap-4 z-35 transition-transform duration-300 ease-cosmevo ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-ink truncate">{product.name}</div>
          <div className="text-xs font-extrabold text-plum">{fmtPrice(product.price)}</div>
        </div>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="btn btn-primary btn-sm py-2.5 px-5 text-xs font-bold"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
