'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
                  href="/#routine"
                  data-cursor="Routine"
                  className="btn btn-primary magnetic bg-warm-white text-ink hover:bg-blush hover:text-ink font-bold py-3.5 px-8"
                >
                  Build Your Routine
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[380px] sm:max-w-[420px] relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-warm-white/5 border border-white/10">
                <Image 
                  src="/images/build-routine-cosmevo.png" 
                  alt="Build Your Cosmevo Routine" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-out" 
                  sizes="(max-width: 1024px) 100vw, 50vw" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
