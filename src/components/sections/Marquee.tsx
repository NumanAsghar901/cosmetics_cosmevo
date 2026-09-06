'use client';

import React from 'react';

export default function Marquee() {
  const items = [
    'Face Care',
    '✦',
    'Hair Care',
    '✦',
    'Soaps',
    '✦',
    'Free Delivery Above Rs. 2,000',
    '✦',
    'Delivery Across Pakistan',
    '✦',
    '7-Day Returns',
    '✦',
  ];

  return (
    <div className="overflow-hidden bg-ink py-3.5 my-8 select-none" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        {/* Track 1 */}
        <div className="flex items-center shrink-0">
          {items.map((text, idx) => (
            <span
              key={`track1-${idx}`}
              className={`px-5 text-[12.5px] font-bold tracking-wider uppercase ${
                text === '✦' ? 'text-peach' : 'text-white/80'
              }`}
            >
              {text}
            </span>
          ))}
        </div>

        {/* Duplicate Track 2 for infinite loop */}
        <div className="flex items-center shrink-0">
          {items.map((text, idx) => (
            <span
              key={`track2-${idx}`}
              className={`px-5 text-[12.5px] font-bold tracking-wider uppercase ${
                text === '✦' ? 'text-peach' : 'text-white/80'
              }`}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
