'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroProps {
  onQuickCategory?: (cat: string) => void;
}

export default function Hero({ onQuickCategory }: HeroProps) {
  const handleScrollToShop = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('shop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="pt-12 md:pt-16 pb-0">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          {/* Copy Column */}
          <div className="hero-copy order-2 lg:order-1">
            <span className="eyebrow reveal-mask"><span className="reveal-inner">Welcome to Cosmevo</span></span>
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-ink leading-[1.06] reveal-mask">
              <span className="reveal-inner">Targeted Skincare for <span className="stroke-text">Clearer</span>, Healthier‑Looking Skin</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-text-secondary leading-relaxed max-w-[460px] reveal">
              Face care, hair care and daily-use soaps — organized simply, so you always know exactly what to buy next.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3.5 mt-7 hero-actions reveal">
              <Link
                href="/shop"
                data-cursor="Shop"
                className="btn btn-primary magnetic"
              >
                Shop Products
              </Link>
              <a
                href="#shop"
                onClick={handleScrollToShop}
                className="btn btn-secondary magnetic"
              >
                Shop by Category
              </a>
            </div>

            {/* Quick jump */}
            <div className="flex flex-wrap items-center gap-3.5 mt-7 text-xs font-semibold text-text-secondary hero-quickshop reveal">
              <span>Jump to:</span>
              <button
                type="button"
                onClick={() => onQuickCategory ? onQuickCategory('face') : window.location.assign('/shop?category=face')}
                className="font-bold text-ink border-b border-border-subtle pb-0.5 hover:text-plum hover:border-plum transition-colors"
              >
                Face Care
              </button>
              <button
                type="button"
                onClick={() => onQuickCategory ? onQuickCategory('hair') : window.location.assign('/shop?category=hair')}
                className="font-bold text-ink border-b border-border-subtle pb-0.5 hover:text-plum hover:border-plum transition-colors"
              >
                Hair Care
              </button>
              <button
                type="button"
                onClick={() => onQuickCategory ? onQuickCategory('soap') : window.location.assign('/shop?category=soap')}
                className="font-bold text-ink border-b border-border-subtle pb-0.5 hover:text-plum hover:border-plum transition-colors"
              >
                Soaps
              </button>
            </div>
          </div>

          {/* Visual Showcase Column */}
          <div className="hero-visual grid grid-cols-2 gap-4 order-1 lg:order-2 reveal">
            <div className="translate-y-4 relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm bg-cream">
              <Image src="/images/Product-routine image.png" alt="Product routine" fill className="object-cover hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 1024px) 50vw, 25vw" priority />
            </div>
            <div className="-translate-y-2 relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-sm bg-cream">
              <Image src="/images/Body & Baby Care image.png" alt="Body and baby care" fill className="object-cover hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 1024px) 50vw, 25vw" priority />
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-x-7 gap-y-2.5 py-8 mt-10 border-t border-border-subtle text-xs sm:text-sm font-semibold text-text-secondary hero-trust reveal">
          <span className="flex items-center gap-1.5">
            <b className="text-plum font-extrabold">✓</b> Free delivery above Rs. 2,500
          </span>
          <span className="flex items-center gap-1.5">
            <b className="text-plum font-extrabold">✓</b> 7-day eligible returns
          </span>
          <span className="flex items-center gap-1.5">
            <b className="text-plum font-extrabold">✓</b> WhatsApp support
          </span>
          <span className="flex items-center gap-1.5">
            <b className="text-plum font-extrabold">✓</b> Bank / JazzCash / EasyPaisa
          </span>
        </div>
      </div>
    </section>
  );
}
