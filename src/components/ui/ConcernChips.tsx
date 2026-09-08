'use client';

import React from 'react';
import { DbSubcategory } from '@/lib/types';

interface ConcernChipsProps {
  selected: string | null;
  onSelect: (concern: string | null) => void;
  subcategories: DbSubcategory[];
}

export default function ConcernChips({ selected, onSelect, subcategories }: ConcernChipsProps) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-9">
      {subcategories.map((concern) => {
        const isActive = selected === concern.slug;
        return (
          <button
            key={concern.slug}
            type="button"
            onClick={() => onSelect(isActive ? null : concern.slug)}
            className={`px-4 py-2 rounded-full border border-solid text-[12.5px] font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-plum border-plum text-white shadow-sm'
                : 'border-[#D1D5DB] text-ink bg-white hover:border-plum hover:text-plum'
            }`}
          >
            {concern.name}
          </button>
        );
      })}
    </div>
  );
}
