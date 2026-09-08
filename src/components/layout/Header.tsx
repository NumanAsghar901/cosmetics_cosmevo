'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useModal } from '@/context/ModalContext';
import { WA_DISPLAY } from '@/lib/constants';
import { DbCategory } from '@/lib/types';

export default function Header({ categories = [] }: { categories?: DbCategory[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, openCart } = useCart();
  const { openSearch } = useModal();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top Announcement Bar */}
      <div
        id="announcement"
        className="bg-ink text-white text-center text-[12.5px] font-medium py-2.5 px-4 tracking-normal"
      >
        <span className="hidden sm:inline">
          Free delivery on orders above Rs. 2,000 &nbsp;|&nbsp; Delivery across Pakistan &nbsp;|&nbsp; WhatsApp Support: {WA_DISPLAY}
        </span>
        <span className="inline sm:hidden">
          Free delivery above Rs. 2,000 | WhatsApp: {WA_DISPLAY}
        </span>
      </div>

      {/* Main Sticky Header */}
      <header
        id="site-header"
        className={`sticky top-0 z-40 transition-all duration-300 ease-cosmevo border-b ${
          isScrolled
            ? 'bg-warm-white/90 backdrop-blur-md border-border-subtle shadow-xs'
            : 'bg-warm-white/50 border-transparent'
        }`}
      >
        <div className="max-w-maxw mx-auto px-6 md:px-10 flex items-center justify-between py-4">
          {/* Brand Logo */}
          <Link
            href="/"
            data-cursor="Home"
            className="text-xl font-extrabold tracking-tight text-ink"
          >
            Cosmevo<span className="text-plum">.</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            <Link
              href="/shop"
              className={`text-[15px] font-semibold transition-colors py-1 hover:text-plum ${
                pathname === '/shop' ? 'text-plum' : 'text-ink'
              }`}
            >
              Shop
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="text-[15px] font-semibold text-ink hover:text-plum py-1 capitalize"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/about"
              className={`text-[15px] font-semibold transition-colors py-1 hover:text-plum ${
                pathname === '/about' ? 'text-plum' : 'text-ink'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Nav Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Search products"
              onClick={openSearch}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream text-ink transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.6" y2="16.6" />
              </svg>
            </button>

            <button
              id="cartIconBtn"
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream text-ink transition-colors relative"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span
                  id="cartCount"
                  className="absolute top-1 right-1 bg-plum text-white text-[10px] font-extrabold min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 animate-pulse-scale"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream text-ink transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden flex flex-col bg-warm-white border-t border-border-subtle px-6 py-4 space-y-1 animate-fadeIn"
          >
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-[15px] font-semibold text-ink border-b border-border-subtle/50 hover:text-plum"
            >
              Shop
            </Link>
            {categories.map((cat) => (
              <Link
                key={`mobile-${cat.id}`}
                href={`/shop?category=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-[15px] font-semibold text-ink border-b border-border-subtle/50 hover:text-plum capitalize"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 text-[15px] font-semibold text-ink hover:text-plum"
            >
              About &amp; Contact
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
