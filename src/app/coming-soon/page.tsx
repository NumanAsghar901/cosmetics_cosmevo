import React from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/products';
import ProductCard from '@/components/ui/ProductCard';
import { WA_DISPLAY } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { Sparkles, Bell, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Coming Soon | Cosmevo Cosmeceuticals',
  description: 'Preview upcoming dermatological skincare and haircare formulas currently in development at Cosmevo. Explore full ingredients and active benefits before official launch.',
};

export default async function ComingSoonPage() {
  const allProducts = await getAllProducts();
  const comingSoonProducts = allProducts.filter((p) => Boolean(p.is_coming_soon));

  const waNotifyUrl = getWhatsAppUrl('Hi Cosmevo, I want to get notified when your new upcoming products launch.');

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-plum transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink">Coming Soon</span>
        </div>

        {/* Hero Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            Upcoming Releases &amp; Formula Previews
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
            Coming Soon to Cosmevo<span className="text-plum">.</span>
          </h1>
          <p className="text-base sm:text-lg text-text-secondary mt-4 leading-relaxed">
            Explore our forthcoming clinical skincare and targeted haircare innovations. These products are currently in formulation and stability testing. Ordering is not open yet, but all formula details, active benefits, and routine tips are displayed below for your preview.
          </p>
        </div>

        {/* Products Grid */}
        {comingSoonProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {comingSoonProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-cream rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto my-6 border border-border-subtle shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-warm-white text-plum flex items-center justify-center mx-auto mb-5 shadow-soft">
              <Sparkles size={30} />
            </div>
            <h3 className="text-xl font-extrabold text-ink">New Formulations in the Lab</h3>
            <p className="text-sm text-text-secondary mt-2.5 max-w-md mx-auto leading-relaxed">
              Our clinical team is currently working on upcoming dermatological skincare and anti-hair fall sprays. Sign up or message our team on WhatsApp to be the first to know when new formulas go live!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3.5">
              <a
                href={waNotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary magnetic shadow-soft"
              >
                Notify Me on WhatsApp
              </a>
              <Link href="/shop" className="btn btn-secondary magnetic">
                Explore Available Products
              </Link>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-border-subtle">
          <div className="bg-warm-white p-6 rounded-2xl border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h4 className="text-base font-bold text-ink mb-1.5">Formula Transparency</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              We publish complete active ingredients and clinical rationale early so you can evaluate routines before products arrive.
            </p>
          </div>

          <div className="bg-warm-white p-6 rounded-2xl border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center mb-4">
              <Bell size={20} />
            </div>
            <h4 className="text-base font-bold text-ink mb-1.5">WhatsApp Waitlist</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Contact our product support directly to reserve early batch notifications and direct-order launch discounts.
            </p>
          </div>

          <div className="bg-warm-white p-6 rounded-2xl border border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-base font-bold text-ink mb-1.5">Rigorous Testing</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every formula undergoes thorough dermatological evaluation and stability assessment before release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
