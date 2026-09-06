'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hasLabel, setHasLabel] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [label, setLabel] = useState('');

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname(); // Re-run effect or reset when route changes

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || reduceMotion) {
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add('custom-cursor-active');

    // Internal state for cursor positions
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
      }
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }
      animFrameId = requestAnimationFrame(loop);
    };

    // Initialize position instantly if we can
    if (dotRef.current && ringRef.current) {
      dotRef.current.style.left = `${mouseX}px`;
      dotRef.current.style.top = `${mouseY}px`;
      ringRef.current.style.left = `${ringX}px`;
      ringRef.current.style.top = `${ringY}px`;
    }

    animFrameId = requestAnimationFrame(loop);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const withLabel = target.closest('[data-cursor]') as HTMLElement | null;
      const interactive = target.closest('a, button, summary, input, textarea, select');

      if (withLabel) {
        setLabel(withLabel.getAttribute('data-cursor') || '');
        setIsHovering(true);
        setHasLabel(true);
      } else if (interactive) {
        setLabel('');
        setIsHovering(true);
        setHasLabel(false);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      const stillInteractive =
        related &&
        (related.closest('[data-cursor]') || related.closest('a, button, summary, input, textarea, select'));

      if (!stillInteractive) {
        setIsHovering(false);
        setHasLabel(false);
        setLabel('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animFrameId);
    };
  }, [pathname]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 rounded-full border-[1.5px] border-white pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 mix-blend-difference flex items-center justify-center transition-[width,height] duration-300 ${
          hasLabel
            ? 'w-20 h-20 bg-white/[0.02]'
            : isHovering
            ? 'w-[54px] h-[54px]'
            : 'w-[34px] h-[34px]'
        }`}
        style={{ transitionTimingFunction: 'var(--ease)' }}
      >
        <span
          className={`text-[11px] font-bold tracking-wider uppercase text-white whitespace-nowrap transition-opacity duration-200 ${
            hasLabel ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {label}
        </span>
      </div>
    </>
  );
}

