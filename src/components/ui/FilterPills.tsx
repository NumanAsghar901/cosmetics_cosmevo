'use client';

import React, { useRef, useEffect, useState } from 'react';
import { DbCategory } from '@/lib/types';

interface FilterPillsProps {
  selected: string;
  onSelect: (category: string) => void;
  categories: DbCategory[];
}

export default function FilterPills({ selected, onSelect, categories }: FilterPillsProps) {
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

      {[{ slug: 'all', name: 'All' }, ...categories].map((cat) => {
        const isActive = selected === cat.slug;
        return (
          <button
            key={cat.slug}
            type="button"
            data-filter={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`relative z-10 px-5 py-2.5 text-sm font-bold rounded-full transition-colors duration-250 whitespace-nowrap ${
              isActive ? 'text-white' : 'text-ink hover:text-plum'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
