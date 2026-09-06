'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WA_DISPLAY, SUPPORT_EMAIL } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FaqAccordion from '@/components/sections/FaqAccordion';
import CtaBanner from '@/components/sections/CtaBanner';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    orderNumber: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject || 'General Inquiry',
            order_number: formData.orderNumber,
            message: formData.message,
            status: 'unread',
          },
        ]);
      } catch {
        // graceful offline fallback
      }
    }

    setIsSubmitting(false);
    setStatusMessage('Thank you — your message has been sent. We will get back to you shortly.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      orderNumber: '',
      message: '',
    });
  };

  const waContactUrl = getWhatsAppUrl('Hi Cosmevo, I have an inquiry.');

  return (
    <div>
      {/* 1. HERO / STORY */}
      <section className="pt-12 md:pt-16 pb-12">
        <div className="max-w-maxw mx-auto px-6 md:px-10">
          <div className="max-w-2xl">
            <span className="eyebrow reveal-mask"><span className="reveal-inner">About Cosmevo</span></span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-tight reveal-mask">
              <span className="reveal-inner">Personal Care Built with <span className="stroke-text">Clarity</span> and Intention.</span>
            </h1>
            <p className="text-base sm:text-lg text-text-secondary mt-5 leading-relaxed reveal max-w-[540px]">
              Cosmevo Cosmeceuticals was created with a clear focus: make daily skin and hair routines easier to understand, compare and trust.
            </p>
          </div>

          {/* 3 Categories Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <Link
              href="/shop?category=face"
              data-cursor="Explore"
              className="bg-cream rounded-2xl p-7 hover:-translate-y-1 transition-transform duration-300 shadow-xs reveal"
            >
              <h3 className="text-lg font-bold text-ink mb-2">Face Care</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                For cleansing, acne-prone skin and brightening-focused routines.
              </p>
            </Link>

            <Link
              href="/shop?category=hair"
              data-cursor="Explore"
              className="bg-cream rounded-2xl p-7 hover:-translate-y-1 transition-transform duration-300 shadow-xs reveal"
            >
              <h3 className="text-lg font-bold text-ink mb-2">Hair Care</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Grow Up shampoo and spray for everyday hair and scalp-care routines.
              </p>
            </Link>

            <Link
              href="/shop?category=soap"
              data-cursor="Explore"
              className="bg-cream rounded-2xl p-7 hover:-translate-y-1 transition-transform duration-300 shadow-xs reveal"
            >
              <h3 className="text-lg font-bold text-ink mb-2">Soaps</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A range of targeted cleansing products across multiple Cosmevo families.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BRAND PRINCIPLES */}
      <section className="py-14 bg-cream">
        <div className="max-w-maxw mx-auto px-6 md:px-10">
          <div className="max-w-xl mx-auto text-center mb-10 reveal">
            <span className="eyebrow">Brand Principles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              What Guides Cosmevo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-warm-white rounded-2xl p-8 shadow-xs reveal">
              <h3 className="text-lg font-bold text-ink mb-2">Clarity</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Product information should be easy to understand.
              </p>
            </div>

            <div className="bg-warm-white rounded-2xl p-8 shadow-xs reveal">
              <h3 className="text-lg font-bold text-ink mb-2">Routine</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Products should fit naturally into everyday personal care.
              </p>
            </div>

            <div className="bg-warm-white rounded-2xl p-8 shadow-xs reveal">
              <h3 className="text-lg font-bold text-ink mb-2">Support</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Customers should be able to get help before and after ordering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONTACT SECTION */}
      <section id="contact" className="py-16 md:py-24 scroll-mt-20 section-alt">
        <div className="max-w-maxw mx-auto px-6 md:px-10">
          <div className="max-w-xl mx-auto text-center mb-12 reveal">
            <span className="eyebrow">Get in Touch</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              Need Help? Talk to Cosmevo.
            </h2>
            <p className="text-base text-text-secondary mt-3">
              Contact our team for order support or help understanding which Cosmevo product may suit your routine.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-warm-white rounded-2xl p-7 text-center reveal">
              <h3 className="text-base font-bold text-ink mb-1">WhatsApp</h3>
              <p className="text-sm text-text-secondary mb-4">{WA_DISPLAY}</p>
              <a
                href={waContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm magnetic"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="bg-warm-white rounded-2xl p-7 text-center reveal">
              <h3 className="text-base font-bold text-ink mb-1">Email</h3>
              <p className="text-sm text-text-secondary mb-4">{SUPPORT_EMAIL}</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="btn btn-secondary btn-sm magnetic"
              >
                Send an Email
              </a>
            </div>

            <div className="bg-warm-white rounded-2xl p-7 text-center flex flex-col justify-center reveal">
              <h3 className="text-base font-bold text-ink mb-1">Delivery</h3>
              <p className="text-sm text-text-secondary">Across Pakistan — usually 3–5 working days.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-cream rounded-[24px] p-8 sm:p-10 shadow-xs">
            <h3 className="text-xl font-bold text-ink mb-6">Send Us a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Full Name <span className="text-plum">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-warm-white text-sm focus:outline-none focus:border-plum"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Email <span className="text-plum">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-warm-white text-sm focus:outline-none focus:border-plum"
                    placeholder="yourname@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-warm-white text-sm focus:outline-none focus:border-plum"
                    placeholder="0300 1234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-warm-white text-sm focus:outline-none focus:border-plum"
                    placeholder="e.g. Order Inquiry"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Order Number (optional)</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-warm-white text-sm focus:outline-none focus:border-plum"
                  placeholder="e.g. COS-482913"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Message <span className="text-plum">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full py-3 px-4 rounded-xl border border-border-subtle bg-warm-white text-sm focus:outline-none focus:border-plum"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-block magnetic py-3.5 text-sm font-bold"
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>

              {statusMessage && (
                <p className="text-sm font-bold text-plum text-center mt-3 animate-fadeIn">
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <FaqAccordion />

      {/* 5. CTA BANNER */}
      <CtaBanner />
    </div>
  );
}
