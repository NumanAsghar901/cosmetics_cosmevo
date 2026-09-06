'use client';

import React from 'react';
import Link from 'next/link';
import ProductArt from '@/components/ui/ProductArt';

export default function CtaBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        <div className="bg-ink text-white rounded-[28px] overflow-hidden p-8 sm:p-12 md:p-16 relative cta-banner reveal">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-center cta-banner-grid">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Build Your Cosmevo Routine
              </h2>
              <p className="mt-4 text-base text-white/70 max-w-[420px] leading-relaxed">
                Explore face care, hair care and daily cleansing products designed around everyday personal-care needs.
              </p>
              <div className="mt-7">
                <Link
                  href="/shop"
                  data-cursor="Shop"
                  className="btn btn-primary magnetic bg-warm-white text-ink hover:bg-blush hover:text-ink font-bold py-3.5 px-8"
                >
                  Shop the Collection
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[320px]">
                <ProductArt tone="soap" cursorLabel="View" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
