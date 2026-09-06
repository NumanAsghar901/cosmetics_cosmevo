'use client';

import React from 'react';
import ProductArt from '@/components/ui/ProductArt';

export default function WhyCosmevo() {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="eyebrow">Why Cosmevo</span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-ink leading-tight reveal">
              Personal Care That Feels Easier to Understand.
            </h2>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mt-4 reveal">
              Cosmevo brings face care, hair care and targeted cleansing products together through clear product families and practical daily-use routines.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 why-bullets">
              {/* Bullet 1 */}
              <div className="flex items-start gap-3.5 why-bullet reveal">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-plum shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink mb-1">Clear Product Families</h4>
                  <p className="text-xs sm:text-[13px] text-text-secondary leading-normal">
                    Organized to make comparison and selection easier.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-3.5 why-bullet reveal">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-plum shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink mb-1">Support Before You Buy</h4>
                  <p className="text-xs sm:text-[13px] text-text-secondary leading-normal">
                    Reach Cosmevo on WhatsApp for product or order help.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-3.5 why-bullet reveal">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-plum shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="7" width="15" height="11" rx="2" />
                    <path d="M16 10h4l3 4v4h-7" />
                    <circle cx="6" cy="20" r="1.6" />
                    <circle cx="18.5" cy="20" r="1.6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink mb-1">Delivery Across Pakistan</h4>
                  <p className="text-xs sm:text-[13px] text-text-secondary leading-normal">
                    Order online, delivered nationwide in 3–5 days.
                  </p>
                </div>
              </div>

              {/* Bullet 4 */}
              <div className="flex items-start gap-3.5 why-bullet reveal">
                <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-plum shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink mb-1">7-Day Eligible Returns</h4>
                  <p className="text-xs sm:text-[13px] text-text-secondary leading-normal">
                    Unopened, unused products within 7 days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Right */}
          <div className="flex justify-center why-visual reveal">
            <div className="w-full max-w-[400px]">
              <ProductArt tone="soap" cursorLabel="Explore" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
