'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface ProductArtProps {
  tone?: 'face' | 'hair' | 'soap' | string;
  featured?: boolean;
  showQuickAdd?: boolean;
  imageUrl?: string;
  className?: string;
  enableTilt?: boolean;
  cursorLabel?: string;
}

export default function ProductArt({
  tone = 'face',
  featured = false,
  showQuickAdd = false,
  imageUrl,
  className = '',
  enableTilt = true,
  cursorLabel = 'View',
}: ProductArtProps) {
  const artRef = useRef<HTMLDivElement>(null);
  const [isTilting, setIsTilting] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !artRef.current) return;
    const r = artRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    artRef.current.style.transform = `perspective(700px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) scale(1.02)`;
    setIsTilting(true);
  };

  const handleMouseLeave = () => {
    if (!enableTilt || !artRef.current) return;
    artRef.current.style.transform = '';
    setIsTilting(false);
  };

  const resolvedTone = tone === 'hair' ? 'hair' : tone === 'soap' ? 'soap' : 'face';

  return (
    <div
      ref={artRef}
      data-tone={resolvedTone}
      data-cursor={cursorLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`art relative aspect-square rounded-[18px] overflow-hidden isolate ${
        isTilting ? 'tilting' : ''
      } ${className}`}
    >
      {/* Featured Badge */}
      {featured && <span className="art-badge">Featured</span>}

      {/* Real product image if provided */}
      {imageUrl ? (
        <div className="absolute inset-0 z-1 flex items-center justify-center p-4">
          <Image
            src={imageUrl}
            alt="Product art"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
          />
        </div>
      ) : (
        <>
          {/* Architectural Arch */}
          <div className="art-arch" />

          {/* Podium */}
          <div className="art-podium" />

          {/* Bottle / Soap Silhouette */}
          <div className="art-item">
            {resolvedTone !== 'soap' && <div className="art-item-cap" />}
          </div>
        </>
      )}

      {/* Hover Quick Add Label */}
      {showQuickAdd && <div className="art-quickadd">Quick Add</div>}
    </div>
  );
}
