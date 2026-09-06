'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/constants';

interface FilterPillsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function FilterPills({ selected, onSelect }: FilterPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(`[data-filter="${selected}"]`);
    if (activeBtn) {
      setThumbStyle({
        width: activeBtn.offsetWidth,
        left: activeBtn.offsetLeft,
      });
    }
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex bg-cream rounded-full p-[5px] gap-[2px] shadow-sm max-w-full overflow-x-auto no-scrollbar"
    >
      {/* Sliding Active Pill Background */}
      <span
        aria-hidden="true"
        className="absolute top-[5px] h-[calc(100%-10px)] bg-plum rounded-full transition-all duration-300 ease-cosmevo z-0 pointer-events-none"
        style={{
          width: `${thumbStyle.width}px`,
          transform: `translateX(${thumbStyle.left}px)`,
        }}
      />

      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            data-filter={cat.key}
            onClick={() => onSelect(cat.key)}
            className={`relative z-10 px-5 py-2.5 text-sm font-bold rounded-full transition-colors duration-250 whitespace-nowrap ${
              isActive ? 'text-white' : 'text-ink hover:text-plum'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
