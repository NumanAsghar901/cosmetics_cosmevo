'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import { fmtPrice, genOrderRef, getToneFor, getWhatsAppUrl } from '@/lib/utils';
import { getProductById } from '@/lib/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ProductArt from '@/components/ui/ProductArt';

export default function CheckoutPage() {
  const { cart, cartSubtotal, changeQty, removeFromCart, clearCart, products } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: '',
    payment: 'bank',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    reference: string;
    fullName: string;
    phone: string;
    city: string;
    payment: string;
    subtotal: number;
    deliveryFree: boolean;
  } | null>(null);

  const isDeliveryFree = cartSubtotal >= FREE_DELIVERY_THRESHOLD;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter your full name.';
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errs.phone = 'Please enter a valid phone number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.city.trim()) errs.city = 'Please enter your city.';
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = 'Please enter your complete delivery address.';
    }
    if (!formData.payment) errs.payment = 'Please select a payment method.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const ref = genOrderRef();
    const orderItems = cart.map((c) => {
      const p = getProductById(c.id, products);
      return {
        product_id: c.id,
        product_name: p ? p.name : 'Cosmevo Item',
        price: p ? p.price : 0,
        qty: c.qty,
      };
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert([
          {
            reference: ref,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: `${formData.address}, ${formData.city}`,
            notes: formData.notes,
            items: orderItems,
            subtotal: cartSubtotal,
            total: cartSubtotal,
            payment_method: formData.payment,
            status: 'pending',
          },
        ]);
      } catch {
        // graceful offline fallback
      }
    }

    setCompletedOrder({
      reference: ref,
      fullName: formData.fullName,
      phone: formData.phone,
      city: formData.city,
      payment: formData.payment,
      subtotal: cartSubtotal,
      deliveryFree: isDeliveryFree,
    });

    clearCart();
    setIsSubmitting(false);
  };

  if (completedOrder) {
    const waConfirmationUrl = getWhatsAppUrl(
      `Hi Cosmevo, following up on my confirmed order ${completedOrder.reference} for ${completedOrder.fullName}.`
    );

    return (
      <div className="py-12 md:py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-plum text-white flex items-center justify-center mx-auto mb-6 shadow-soft">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">Order Received</h1>
          <p className="text-base text-text-secondary mt-2">
            Thanks, {completedOrder.fullName.split(' ')[0]} — your order is registered.
          </p>

          <div className="bg-cream rounded-2xl p-6 my-8 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Order Reference</span>
              <span className="text-base font-extrabold text-plum font-mono">{completedOrder.reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Deliver To:</span>
              <span className="font-bold text-ink">{completedOrder.fullName}, {completedOrder.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Phone:</span>
              <span className="font-bold text-ink">{completedOrder.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Payment Method:</span>
              <span className="font-bold text-ink uppercase">{completedOrder.payment}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">Order Total</span>
              <span className="font-extrabold text-ink">
                {fmtPrice(completedOrder.subtotal + (completedOrder.deliveryFree ? 0 : 200))} {completedOrder.deliveryFree ? '(Free Delivery)' : '(incl. Rs. 200 delivery)'}
              </span>
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-8 leading-relaxed">
            Our support team will contact you on WhatsApp or phone within 24 hours to confirm your delivery and share payment account details.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={waConfirmationUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Chat"
              className="btn btn-primary magnetic"
            >
              Chat on WhatsApp
            </a>
            <Link href="/shop" className="btn btn-secondary magnetic">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="max-w-md mx-auto px-6">
          <h2 className="text-2xl font-bold text-ink mb-2">Your Cart is Empty</h2>
          <p className="text-text-secondary text-sm mb-6">
            You don&apos;t have any products in your cart yet.
          </p>
          <Link href="/shop" className="btn btn-primary magnetic">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-14">
      <div className="max-w-maxw mx-auto px-6 md:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-plum transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ink">Checkout</span>
        </div>

        <div className="mb-8">
          <span className="eyebrow">Checkout</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Complete Your Order
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-8 bg-warm-white">
            {/* Step 1: Contact & Shipping */}
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle mb-6">
                <span className="w-7 h-7 rounded-full bg-plum text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-lg font-bold text-ink">Contact &amp; Delivery Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Full Name <span className="text-plum">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none transition-colors ${
                      errors.fullName ? 'border-red-500 bg-red-50/20' : 'border-border-subtle focus:border-plum'
                    }`}
                    placeholder="Ahmed Khan"
                  />
                  {errors.fullName && <span className="text-xs text-red-600 mt-1 block">{errors.fullName}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Phone Number <span className="text-plum">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none transition-colors ${
                      errors.phone ? 'border-red-500 bg-red-50/20' : 'border-border-subtle focus:border-plum'
                    }`}
                    placeholder="0300 1234567"
                  />
                  {errors.phone && <span className="text-xs text-red-600 mt-1 block">{errors.phone}</span>}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Email Address <span className="text-plum">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50/20' : 'border-border-subtle focus:border-plum'
                  }`}
                  placeholder="yourname@gmail.com"
                />
                {errors.email && <span className="text-xs text-red-600 mt-1 block">{errors.email}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    City <span className="text-plum">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none transition-colors ${
                      errors.city ? 'border-red-500 bg-red-50/20' : 'border-border-subtle focus:border-plum'
                    }`}
                    placeholder="Lahore, Karachi…"
                  />
                  {errors.city && <span className="text-xs text-red-600 mt-1 block">{errors.city}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Complete Street Address <span className="text-plum">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full py-3 px-4 rounded-xl border text-sm focus:outline-none transition-colors ${
                      errors.address ? 'border-red-500 bg-red-50/20' : 'border-border-subtle focus:border-plum'
                    }`}
                    placeholder="House / Street / Sector / Area"
                  />
                  {errors.address && <span className="text-xs text-red-600 mt-1 block">{errors.address}</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Order Notes (optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nearby landmark, delivery timing instructions…"
                  className="w-full py-3 px-4 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-border-subtle mb-6">
                <span className="w-7 h-7 rounded-full bg-plum text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="text-lg font-bold text-ink">Payment Method</h3>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setFormData({ ...formData, payment: 'bank' })}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.payment === 'bank' ? 'border-plum bg-plum/5 shadow-xs' : 'border-border-subtle hover:bg-cream'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={formData.payment === 'bank'}
                    onChange={() => {}}
                    className="mt-1 accent-plum"
                  />
                  <div>
                    <span className="text-sm font-bold text-ink block">Bank Transfer</span>
                    <span className="text-xs text-text-secondary block mt-0.5">
                      Account details are shared via WhatsApp once your order is confirmed.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setFormData({ ...formData, payment: 'jazzcash' })}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.payment === 'jazzcash' ? 'border-plum bg-plum/5 shadow-xs' : 'border-border-subtle hover:bg-cream'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="jazzcash"
                    checked={formData.payment === 'jazzcash'}
                    onChange={() => {}}
                    className="mt-1 accent-plum"
                  />
                  <div>
                    <span className="text-sm font-bold text-ink block">JazzCash</span>
                    <span className="text-xs text-text-secondary block mt-0.5">
                      JazzCash wallet number sent to your WhatsApp after ordering.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setFormData({ ...formData, payment: 'easypaisa' })}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.payment === 'easypaisa' ? 'border-plum bg-plum/5 shadow-xs' : 'border-border-subtle hover:bg-cream'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="easypaisa"
                    checked={formData.payment === 'easypaisa'}
                    onChange={() => {}}
                    className="mt-1 accent-plum"
                  />
                  <div>
                    <span className="text-sm font-bold text-ink block">EasyPaisa</span>
                    <span className="text-xs text-text-secondary block mt-0.5">
                      EasyPaisa mobile transfer instructions provided via WhatsApp.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-block magnetic py-4 text-base font-bold shadow-soft"
            >
              {isSubmitting ? 'Placing Order…' : 'Place Order'}
            </button>
            <p className="text-[12.5px] text-text-secondary text-center">
              By placing your order you agree to be contacted via WhatsApp or phone to confirm details.
            </p>
          </form>

          {/* Order Summary Right Panel */}
          <div className="bg-cream rounded-[24px] p-6 sm:p-8 sticky top-28">
            <h3 className="text-lg font-bold text-ink mb-5 pb-3 border-b border-border-subtle">
              Order Summary
            </h3>

            <div className="divide-y divide-border-subtle mb-6 max-h-[360px] overflow-y-auto pr-1">
              {cart.map((item) => {
                const p = getProductById(item.id, products);
                if (!p) return null;
                const tone = getToneFor(p.category);

                return (
                  <div key={item.id} className="py-3.5 flex items-center gap-3.5">
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden">
                      <ProductArt
                        tone={tone}
                        imageUrl={p.image_url}
                        enableTilt={false}
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-ink truncate">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                        <span>Qty:</span>
                        <div className="flex items-center gap-1 bg-warm-white rounded-md px-1.5 py-0.5 border border-border-subtle">
                          <button
                            type="button"
                            onClick={() => changeQty(item.id, -1)}
                            className="font-bold text-xs hover:text-plum px-1"
                          >
                            –
                          </button>
                          <span className="font-bold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => changeQty(item.id, 1)}
                            className="font-bold text-xs hover:text-plum px-1"
                          >
                            +
                          </button>
                        </div>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="hover:text-plum underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-ink ml-auto shrink-0">
                      {fmtPrice(p.price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-border-subtle text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-bold text-ink">{fmtPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Delivery</span>
                <span className={`font-bold ${isDeliveryFree ? 'text-plum' : 'text-ink'}`}>
                  {isDeliveryFree ? 'Free' : 'Rs. 200'}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-ink pt-3 border-t border-border-subtle">
                <span>Total</span>
                <span>{fmtPrice(cartSubtotal + (isDeliveryFree ? 0 : 200))}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-secondary leading-relaxed">
              {isDeliveryFree ? (
                <span className="text-plum font-semibold">✓ Free delivery threshold reached!</span>
              ) : (
                <span>
                  Free delivery applies to orders above {fmtPrice(FREE_DELIVERY_THRESHOLD)}. Delivery fee will be confirmed on WhatsApp.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
