'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { fmtPrice, getToneFor } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';
import ProductArt from '@/components/ui/ProductArt';
import { 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal, 
  Check, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  ArrowRight,
  Info
} from 'lucide-react';

type BundleType = 'acne' | 'whitening' | 'custom';

interface RoutineBuilderProps {
  products: Product[];
}

export default function RoutineBuilder({ products }: RoutineBuilderProps) {
  const router = useRouter();
  const { addMultipleToCart, openCart } = useCart();
  const { openQuickView } = useModal();
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // Active bundle tab
  const [activeTab, setActiveTab] = useState<BundleType>('acne');

  // Custom tab category filter & search
  const [customCategory, setCustomCategory] = useState<string>('all');
  const [customSearch, setCustomSearch] = useState<string>('');

  // Filtering helpers
  const isAcneProduct = (p: Product) => {
    const fam = (p.family || '').toLowerCase();
    const name = p.name.toLowerCase();
    const slug = p.slug.toLowerCase();
    const concerns = p.concerns || [];
    return (
      fam.includes('acne') ||
      name.includes('acne') ||
      slug.includes('acne') ||
      concerns.includes('acne-prone-skin')
    );
  };

  const isWhiteningProduct = (p: Product) => {
    const fam = (p.family || '').toLowerCase();
    const name = p.name.toLowerCase();
    const slug = p.slug.toLowerCase();
    const concerns = p.concerns || [];
    return (
      fam.includes('giga white') ||
      fam.includes('white') ||
      name.includes('white') ||
      slug.includes('white') ||
      concerns.includes('brightening')
    );
  };

  // Available pools based on active tab
  const acneProducts = useMemo(() => {
    return products.filter((p) => !p.is_coming_soon && isAcneProduct(p));
  }, [products]);

  const whiteningProducts = useMemo(() => {
    return products.filter((p) => !p.is_coming_soon && isWhiteningProduct(p));
  }, [products]);

  const allAvailableProducts = useMemo(() => {
    return products.filter((p) => !p.is_coming_soon);
  }, [products]);

  // Default pre-selected IDs for each bundle type
  const defaultAcneIds = useMemo(() => {
    return acneProducts.slice(0, 2).map((p) => p.id);
  }, [acneProducts]);

  const defaultWhiteningIds = useMemo(() => {
    return whiteningProducts.slice(0, 2).map((p) => p.id);
  }, [whiteningProducts]);

  // Selected product IDs state
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>(defaultAcneIds);

  // Handle switching tabs: enforces that only allowed products can be selected!
  const handleTabChange = (tab: BundleType) => {
    setActiveTab(tab);
    if (tab === 'acne') {
      // Filter current selection to only acne products, or set default acne products
      const validAcne = selectedIds.filter((id) =>
        acneProducts.some((p) => String(p.id) === String(id))
      );
      setSelectedIds(validAcne.length > 0 ? validAcne : defaultAcneIds);
    } else if (tab === 'whitening') {
      // Filter current selection to only whitening products, or set default whitening products
      const validWhitening = selectedIds.filter((id) =>
        whiteningProducts.some((p) => String(p.id) === String(id))
      );
      setSelectedIds(validWhitening.length > 0 ? validWhitening : defaultWhiteningIds);
    } else {
      // Custom bundle allows everything
      if (selectedIds.length === 0) {
        setSelectedIds(allAvailableProducts.slice(0, 2).map((p) => p.id));
      }
    }
  };

  // Products available in current tab
  const tabProducts = useMemo(() => {
    if (activeTab === 'acne') {
      return acneProducts;
    }
    if (activeTab === 'whitening') {
      return whiteningProducts;
    }
    // Custom bundle: apply category and search filter
    return allAvailableProducts.filter((p) => {
      const matchCat = customCategory === 'all' || p.category === customCategory;
      const matchSearch =
        !customSearch.trim() ||
        p.name.toLowerCase().includes(customSearch.toLowerCase()) ||
        p.family.toLowerCase().includes(customSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeTab, acneProducts, whiteningProducts, allAvailableProducts, customCategory, customSearch]);

  // Toggle selection
  const toggleProduct = (productId: number | string) => {
    setSelectedIds((prev) => {
      const exists = prev.some((id) => String(id) === String(productId));
      if (exists) {
        return prev.filter((id) => String(id) !== String(productId));
      } else {
        // Double check tab restriction
        if (activeTab === 'acne') {
          const isAcne = acneProducts.some((p) => String(p.id) === String(productId));
          if (!isAcne) return prev;
        } else if (activeTab === 'whitening') {
          const isWhitening = whiteningProducts.some((p) => String(p.id) === String(productId));
          if (!isWhitening) return prev;
        }
        return [...prev, productId];
      }
    });
  };

  // Currently selected product objects
  const selectedProducts = useMemo(() => {
    return selectedIds
      .map((id) => products.find((p) => String(p.id) === String(id)))
      .filter((p): p is Product => Boolean(p));
  }, [selectedIds, products]);

  // Routine Savings Math:
  // 1 product: 0%
  // 2 products: 10%
  // 3 products: 13%
  // 4 products: 16%
  // N >= 2: 10 + (N - 2) * 3%
  const selectedCount = selectedProducts.length;
  const discountPct = selectedCount < 2 ? 0 : 10 + (selectedCount - 2) * 3;
  const baseSubtotal = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  }, [selectedProducts]);

  const savingsAmount = Math.round((baseSubtotal * discountPct) / 100);
  const routineTotal = Math.max(0, baseSubtotal - savingsAmount);

  // Bundle metadata titles
  const bundleMeta = {
    acne: {
      title: 'Acne Care Routine Bundle',
      badge: 'Targeted Acne Defense',
      desc: 'Formulated exclusively for oily, congested, and breakout-prone skin. Pick from our clinically targeted Acne Ease & purifying formulas.',
    },
    whitening: {
      title: 'Whitening & Radiance Routine Bundle',
      badge: 'Brightening Complex',
      desc: 'Formulated exclusively for brighter, clearer, and more refreshed skin tone. Pick from our Giga White face wash and antioxidant soaps.',
    },
    custom: {
      title: 'Custom Routine Builder',
      badge: 'Build Any Routine',
      desc: 'Mix and match any products from face care, hair care, and daily soaps. Enjoy escalating routine discounts the more steps you add!',
    },
  };

  const handleAddToCart = () => {
    if (selectedCount === 0) return;
    const tabName = bundleMeta[activeTab].title;
    addMultipleToCart(
      selectedIds,
      addBtnRef.current,
      `✨ ${tabName} (${selectedCount} items) added to your cart with ${discountPct}% savings!`
    );
    openCart();
  };

  const handleBuyNow = () => {
    if (selectedCount === 0) return;
    addMultipleToCart(selectedIds, null);
    router.push('/checkout');
  };

  return (
    <section id="routine" className="py-16 md:py-24 bg-cream/50 border-y border-border-subtle scroll-mt-20">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="max-w-[700px] mb-10">
          <span className="eyebrow flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-plum" />
            Save When You Shop Together
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-ink tracking-tight">
            Build Your Cosmevo Routine
          </h2>
          <p className="mt-3 text-base sm:text-lg text-text-secondary leading-relaxed">
            Pick your targeted concern or customize your own everyday routine. Enjoy tiered routine savings: 
            <span className="font-bold text-plum"> 10% OFF for 2 products</span>, 
            <span className="font-bold text-plum"> 13% for 3</span>, 
            <span className="font-bold text-plum"> 16% for 4</span>, and +3% for each additional product.
          </p>
        </div>

        {/* Bundle Type Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-1.5 bg-warm-white rounded-2xl border border-border-subtle w-fit mb-8 shadow-xs">
          <button
            type="button"
            onClick={() => handleTabChange('acne')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'acne'
                ? 'bg-plum text-white shadow-sm'
                : 'text-ink hover:text-plum hover:bg-cream/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Acne Bundle</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('whitening')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'whitening'
                ? 'bg-plum text-white shadow-sm'
                : 'text-ink hover:text-plum hover:bg-cream/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Whitening Bundle</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('custom')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeTab === 'custom'
                ? 'bg-plum text-white shadow-sm'
                : 'text-ink hover:text-plum hover:bg-cream/70'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Custom Bundle</span>
          </button>
        </div>

        {/* Active Mode Notice Banner */}
        <div className="bg-warm-white border border-border-subtle rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blush/60 text-plum flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">{bundleMeta[activeTab].title}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-plum/10 text-plum uppercase tracking-wider">
                  {bundleMeta[activeTab].badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                {bundleMeta[activeTab].desc}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-cream px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-bold text-ink">
            <span>Selected:</span>
            <span className="text-plum text-sm">{selectedCount} {selectedCount === 1 ? 'Product' : 'Products'}</span>
          </div>
        </div>

        {/* Custom Bundle Sub-Filters (Category + Search) */}
        {activeTab === 'custom' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'face', label: 'Face Care' },
                { id: 'hair', label: 'Hair Care' },
                { id: 'soap', label: 'Soaps' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCustomCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    customCategory === c.id
                      ? 'bg-plum text-white'
                      : 'bg-warm-white text-ink border border-border-subtle hover:bg-cream'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs">
              <input
                type="text"
                placeholder="Search products..."
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-8 rounded-full border border-border-subtle bg-warm-white focus:outline-none focus:border-plum"
              />
              <svg
                className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        )}

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Product Selector Cards Grid */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {tabProducts.map((p) => {
                const isSelected = selectedIds.some((id) => String(id) === String(p.id));
                const tone = getToneFor(p.category);

                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`cursor-pointer group relative bg-warm-white rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'border-plum shadow-md bg-blush/10'
                        : 'border-border-subtle hover:border-plum/40 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Selection Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10.5px] font-bold text-plum-muted uppercase tracking-wider truncate">
                        {p.family} · {p.category}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-plum text-white shadow-xs'
                            : 'bg-cream text-text-secondary border border-border-subtle group-hover:border-plum'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Image / Art */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-cream">
                      <ProductArt
                        tone={tone}
                        imageUrl={p.image_url ? p.image_url.split(',')[0].trim() : undefined}
                        enableTilt={false}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="text-sm font-bold text-ink line-clamp-1 group-hover:text-plum transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[12px] text-text-secondary line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                        {p.tagline}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle">
                      <span className="text-sm font-extrabold text-ink">{fmtPrice(p.price)}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProduct(p.id);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-plum text-white'
                            : 'bg-cream text-ink hover:bg-plum hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ In Routine' : '+ Add Step'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {tabProducts.length === 0 && (
              <div className="text-center py-16 bg-warm-white rounded-2xl border border-border-subtle text-text-secondary">
                <p className="text-sm font-medium">No products match your current search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategory('all');
                    setCustomSearch('');
                  }}
                  className="mt-3 text-xs font-bold text-plum underline"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Routine Steps & Dynamic Savings Panel */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="bg-warm-white rounded-3xl p-6 border border-border-subtle shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-plum block">
                    Routine Summary
                  </span>
                  <h3 className="text-lg font-extrabold text-ink">
                    {activeTab === 'acne'
                      ? 'Acne Care Steps'
                      : activeTab === 'whitening'
                      ? 'Whitening Steps'
                      : 'Custom Routine Steps'}
                  </h3>
                </div>
                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-text-secondary hover:text-red-600 underline font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Selected Steps List */}
              <div className="py-4 divide-y divide-border-subtle max-h-[280px] overflow-y-auto pr-1">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <p className="text-sm font-medium">No steps selected yet.</p>
                    <p className="text-xs text-text-secondary/80 mt-1">
                      Click &ldquo;+ Add Step&rdquo; on any product to build your routine.
                    </p>
                  </div>
                ) : (
                  selectedProducts.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5">
                      <div className="w-6 h-6 rounded-full bg-cream font-extrabold text-xs text-plum flex items-center justify-center shrink-0 border border-border-subtle">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-ink truncate">{p.name}</div>
                        <div className="text-[11px] text-text-secondary">{fmtPrice(p.price)}</div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => toggleProduct(p.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-red-600 hover:bg-cream transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>



              {/* Price Calculation Box */}
              <div className="space-y-2 pt-3 border-t border-border-subtle text-sm">
                <div className="flex justify-between text-text-secondary text-xs sm:text-sm">
                  <span>Combined Price</span>
                  <span className="font-semibold text-ink">{fmtPrice(baseSubtotal)}</span>
                </div>

                {savingsAmount > 0 && (
                  <div className="flex justify-between text-plum font-bold text-xs sm:text-sm bg-blush/40 px-2.5 py-1 rounded-lg">
                    <span>Routine Savings ({discountPct}%)</span>
                    <span>-{fmtPrice(savingsAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base sm:text-lg font-extrabold text-ink pt-2 border-t border-border-subtle">
                  <span>Routine Total</span>
                  <span className="text-plum">{fmtPrice(routineTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2">
                <button
                  ref={addBtnRef}
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-block py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-soft hover:shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add Routine to Cart</span>
                </button>

                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={handleBuyNow}
                  className="btn btn-secondary btn-block py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Buy Routine Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-text-secondary text-center mt-3">
                Free delivery across Pakistan on orders above Rs. 2,500
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
