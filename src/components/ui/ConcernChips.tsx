'use client';

import React from 'react';
import { CONCERNS } from '@/lib/constants';

interface ConcernChipsProps {
  selected: string | null;
  onSelect: (concern: string | null) => void;
}

export default function ConcernChips({ selected, onSelect }: ConcernChipsProps) {
  return (
    <div className="flex flex-wrap gap-2.5 mb-9">
      {CONCERNS.map((c) => {
        const isActive = selected === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelect(isActive ? null : c.key)}
            className={`px-4 py-2 rounded-full border text-[12.5px] font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-plum border-plum text-white shadow-sm'
                : 'border-[#E5E7EB] text-text-secondary bg-transparent hover:border-plum hover:text-plum'
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
