'use client';

import React, { useState, useMemo } from 'react';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/sections/Marquee';
import VideoShowcase from '@/components/sections/VideoShowcase';
import WhyCosmevo from '@/components/sections/WhyCosmevo';
import FaqAccordion from '@/components/sections/FaqAccordion';
import CtaBanner from '@/components/sections/CtaBanner';
import FilterPills from '@/components/ui/FilterPills';
import ConcernChips from '@/components/ui/ConcernChips';
import ProductCard from '@/components/ui/ProductCard';
import RoutineBuilder from '@/components/sections/RoutineBuilder';
import { Product, DbCategory, DbSubcategory, ShowcaseVideo } from '@/lib/types';

export default function HomeClient({ 
  initialProducts, 
  categories, 
  subcategories,
  videos = []
}: { 
  initialProducts: Product[]; 
  categories: DbCategory[]; 
  subcategories: DbSubcategory[];
  videos?: ShowcaseVideo[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const list = initialProducts.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchConcern = !selectedConcern || p.concerns.includes(selectedConcern);
      return matchCat && matchConcern;
    });

    // Coming soon products always come first, then others
    return list.sort((a, b) => {
      if (a.is_coming_soon && !b.is_coming_soon) return -1;
      if (!a.is_coming_soon && b.is_coming_soon) return 1;
      return 0;
    });
  }, [initialProducts, selectedCategory, selectedConcern]);

  const handleHeroCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedConcern(null);
    const el = document.getElementById('shop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <Hero onQuickCategory={handleHeroCategorySelect} />

      {/* 2. INFINITE MARQUEE */}
      <Marquee />

      {/* 3. PRODUCT DISCOVERY & SHOPPING */}
      <section id="shop" className="py-14 md:py-20 scroll-mt-20">
        <div className="max-w-maxw mx-auto px-6 md:px-10">
          <div className="max-w-[600px] mb-8 reveal">
            <span className="eyebrow">Cosmevo Collection</span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-ink tracking-tight">
              Shop Our Products
            </h2>
          </div>

          {/* Category Filter Pills with animated thumb */}
          <div className="mb-4">
            <FilterPills
              selected={selectedCategory}
              onSelect={(cat) => {
                setSelectedCategory(cat);
              }}
              categories={categories}
            />
          </div>

          {/* Concern Filter Chips */}
          <ConcernChips
            selected={selectedConcern}
            onSelect={setSelectedConcern}
            subcategories={subcategories}
          />

          {/* Responsive Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 px-4 text-text-secondary">
              <p className="text-base">No products match your selected filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedConcern(null);
                }}
                className="mt-4 text-plum font-bold underline"
              >
                Reset Filters
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
      </section>

      {/* 4. VIDEO SHOWCASE & REELS */}
      <VideoShowcase videos={videos} />

      {/* 5. BUILD YOUR ROUTINE & BUNDLE BUILDER */}
      <RoutineBuilder products={initialProducts} />

      {/* 6. WHY COSMEVO */}
      <WhyCosmevo />

      {/* 6. FAQ ACCORDION */}
      <FaqAccordion />

      {/* 7. CONVERSION CTA BANNER */}
      <CtaBanner />
    </div>
  );
}
