'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import FilterPills from '@/components/ui/FilterPills';
import ConcernChips from '@/components/ui/ConcernChips';
import ProductCard from '@/components/ui/ProductCard';
import CtaBanner from '@/components/sections/CtaBanner';
import { BUNDLED_PRODUCTS } from '@/lib/products';
import { getCategoryLabel } from '@/lib/utils';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get('category') || 'all';
  const concernParam = searchParams.get('concern') || null;

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(concernParam);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (concernParam) setSelectedConcern(concernParam);
  }, [categoryParam, concernParam]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('category', cat);
    if (selectedConcern) params.set('concern', selectedConcern);
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  };

  const handleConcernChange = (concern: string | null) => {
    setSelectedConcern(concern);
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (concern) params.set('concern', concern);
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    return BUNDLED_PRODUCTS.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchConcern = !selectedConcern || p.concerns.includes(selectedConcern);
      return matchCat && matchConcern;
    });
  }, [selectedCategory, selectedConcern]);

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider mb-6 reveal">
          <Link href="/" className="hover:text-plum transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink">Shop</span>
        </div>

        {/* Page Header */}
        <div className="max-w-[700px] mb-8 reveal">
          <span className="eyebrow">Cosmevo Collection</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            Shop All Products
          </h1>
          <p className="mt-3 text-base sm:text-lg text-text-secondary leading-relaxed">
            Browse every Cosmevo face care, hair care and soap product in one place — filter by category or by concern.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 reveal">
          <FilterPills
            selected={selectedCategory}
            onSelect={handleCategoryChange}
          />
        </div>

        <div className="reveal">
          <ConcernChips
            selected={selectedConcern}
            onSelect={handleConcernChange}
          />
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-4 text-text-secondary">
            <p className="text-base">No products match your selected criteria.</p>
            <button
              type="button"
              onClick={() => {
                handleCategoryChange('all');
                handleConcernChange(null);
              }}
              className="mt-4 text-plum font-bold underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <CtaBanner />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Loading shop…</div>}>
      <ShopContent />
    </Suspense>
  );
}
