'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WA_DISPLAY, SUPPORT_EMAIL } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { DbCategory } from '@/lib/types';

export default function Footer({ categories = [] }: { categories?: DbCategory[] }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('subscribers').insert([{ email }]);
      } catch {
        // graceful offline fallback
      }
    }

    setIsLoading(false);
    setIsSubmitted(true);
    setEmail('');
  };

  const waHelpUrl = getWhatsAppUrl('Hi Cosmevo, I need help with my order or product advice.');

  return (
    <footer className="bg-ink text-white/70 pt-0 pb-7 mt-16">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        {/* Newsletter Banner */}
        <div className="border-b border-white/10 py-11 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h3 className="text-white text-xl font-bold">Stay Close to Cosmevo</h3>
            <p className="text-[13.5px] mt-1 text-white/60">
              Product updates, routine tips, and direct-order offers across Pakistan.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-wrap items-center gap-2">
            <label htmlFor="nlEmail" className="sr-only">Email address</label>
            <input
              id="nlEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="py-3 px-5 rounded-full border border-white/20 bg-white/5 text-white text-sm min-w-[240px] focus:outline-none focus:border-peach placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary magnetic bg-warm-white text-ink hover:bg-peach hover:text-ink text-sm py-3 px-6"
            >
              {isLoading ? 'Subscribing…' : 'Subscribe'}
            </button>
            {isSubmitted && (
              <span className="w-full text-xs font-bold text-peach mt-2 block animate-fadeIn">
                Thanks — you&apos;re on the list!
              </span>
            )}
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-9 py-11">
          {/* Brand Info */}
          <div>
            <div className="text-xl font-extrabold text-white mb-3">
              Cosmevo<span className="text-peach">.</span>
            </div>
            <p className="text-[13.5px] text-white/60 leading-relaxed">
              Cosmevo Cosmeceuticals offers targeted face care, hair care, and cleansing products for everyday personal-care needs in Pakistan.
            </p>
            <div className="flex gap-2.5 mt-4 text-xs font-bold text-white/80">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer">IG</span>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer">FB</span>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer">TT</span>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer">YT</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.slug}`} className="hover:text-white transition-colors capitalize">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-wider mb-4">Information</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Cosmevo</Link></li>
              <li><Link href="/distributors" className="hover:text-white transition-colors">Our Distributors</Link></li>
              <li><Link href="/about#contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/about#faq" className="hover:text-white transition-colors">Shipping &amp; Delivery</Link></li>
              <li><Link href="/about#faq" className="hover:text-white transition-colors">7-Day Returns</Link></li>
              <li><button type="button" onClick={() => showToast('Privacy Policy — available soon.')} className="hover:text-white transition-colors text-left">Privacy</button></li>
              <li><button type="button" onClick={() => showToast('Terms of Service — available soon.')} className="hover:text-white transition-colors text-left">Terms</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: {WA_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition-colors">
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="text-white/60 text-[13.5px]">Delivery across all cities in Pakistan</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 text-[12.5px] flex flex-wrap justify-between gap-3 text-white/50">
          <span>&copy; {new Date().getFullYear()} Cosmevo Cosmeceuticals. All rights reserved.</span>
          <a href="https://propfirmstudios.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Design & Developed by Prop Firm Studios
          </a>
        </div>
      </div>
    </footer>
  );
}
