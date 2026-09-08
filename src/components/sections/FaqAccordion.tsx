'use client';

import React, { useState } from 'react';
import { WA_DISPLAY } from '@/lib/constants';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    q: 'How long does delivery take?',
    a: 'Orders are usually delivered within 3–5 working days across Pakistan.',
  },
  {
    q: 'Is delivery really free?',
    a: 'Delivery is free on all orders above Rs. 2,500.',
  },
  {
    q: 'Can I return a product?',
    a: 'Eligible unopened and unused products in original packaging can be returned within 7 days.',
  },
  {
    q: 'What payment methods are available?',
    a: 'Bank Transfer, JazzCash and EasyPaisa.',
  },
  {
    q: 'How do I get help choosing a product?',
    a: `Message Cosmevo on WhatsApp at ${WA_DISPLAY} — we'll help you find the right fit.`,
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        <div className="max-w-[600px] mx-auto text-center mb-10 reveal">
          <span className="eyebrow">Before You Order</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Quick Answers
          </h2>
        </div>

        <div className="max-w-[720px] mx-auto divide-y divide-border-subtle reveal">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-base sm:text-[17px] text-ink hover:text-plum transition-colors"
                >
                  <span>{item.q}</span>
                  <span
                    className={`relative w-5 h-5 shrink-0 flex items-center justify-center transition-transform duration-250 ${
                      isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    <span className="absolute w-full h-[2px] bg-ink rounded-full" />
                    <span className="absolute h-full w-[2px] bg-ink rounded-full" />
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-3 text-[14.5px] text-text-secondary leading-relaxed pr-8 animate-fadeIn">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
