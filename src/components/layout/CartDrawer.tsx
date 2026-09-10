'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import { fmtPrice, getToneFor } from '@/lib/utils';
import { getProductById } from '@/lib/products';
import ProductArt from '@/components/ui/ProductArt';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    closeCart, 
    cart, 
    cartCount,
    cartSubtotal, 
    routineDiscountPct,
    routineSavings,
    cartTotal,
    changeQty, 
    removeFromCart, 
    products 
  } = useCart();

  const effectiveTotal = routineSavings > 0 ? cartTotal : cartSubtotal;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - effectiveTotal);
  const progressPct = Math.min(100, (effectiveTotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 bg-ink/40 z-50 backdrop-blur-xs transition-opacity duration-300 ease-cosmevo ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-over Drawer */}
      <aside
        id="cart-drawer"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-warm-white z-[51] shadow-2xl flex flex-col transition-transform duration-400 ease-cosmevo ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle shrink-0">
          <h3 className="text-lg font-bold text-ink">Your Cart</h3>
          <button
            type="button"
            data-cursor="Close"
            aria-label="Close cart"
            onClick={closeCart}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream text-ink transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border-subtle">
          {cart.length === 0 ? (
            <div className="text-center py-20 px-4 text-text-secondary">
              <p className="text-base mb-4">Your cart is empty.</p>
              <button
                type="button"
                onClick={closeCart}
                className="btn btn-primary"
              >
                Explore Products
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const p = getProductById(item.id, products);
              if (!p) return null;
              const tone = getToneFor(p.category);

              return (
                <div key={item.id} className="flex gap-3.5 py-4">
                  <div className="w-[74px] h-[74px] shrink-0 rounded-xl overflow-hidden">
                    <ProductArt
                      tone={tone}
                      imageUrl={p.image_url ? p.image_url.split(',')[0].trim() : undefined}
                      enableTilt={false}
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-plum-muted uppercase tracking-wider block">
                        {p.family}
                      </span>
                      <h4 className="text-sm font-bold text-ink truncate mt-0.5">
                        {p.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-cream rounded-full px-2.5 py-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => changeQty(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-sm text-ink hover:text-plum transition-colors"
                        >
                          –
                        </button>
                        <span className="text-xs font-bold text-ink min-w-[16px] text-center">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => changeQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-sm text-ink hover:text-plum transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-ink">
                        {fmtPrice(p.price * item.qty)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-text-secondary hover:text-plum underline self-start mt-1.5 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border-subtle bg-warm-white shrink-0">
            {/* Free Shipping Calculation */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                {remaining > 0 ? (
                  <span>{fmtPrice(remaining)} away from free delivery</span>
                ) : (
                  <span className="text-plum">Free delivery unlocked ✓</span>
                )}
                <span className="text-text-secondary">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full bg-plum rounded-full transition-all duration-400 ease-cosmevo"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Subtotal</span>
                <span className="font-bold text-ink">{fmtPrice(cartSubtotal)}</span>
              </div>

              {routineSavings > 0 ? (
                <div className="bg-blush/40 border border-plum/15 rounded-xl p-2.5 space-y-1">
                  <div className="flex justify-between items-center text-sm font-bold text-plum">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-plum animate-pulse" />
                      Routine Savings ({routineDiscountPct}%)
                    </span>
                    <span>-{fmtPrice(routineSavings)}</span>
                  </div>
                  <p className="text-[11px] text-plum-muted font-medium">
                    {cartCount >= 2
                      ? `Add 1 more product to unlock ${routineDiscountPct + 3}% savings!`
                      : ''}
                  </p>
                </div>
              ) : cartCount === 1 ? (
                <div className="text-[12px] font-medium text-plum bg-cream border border-border-subtle px-3 py-2 rounded-xl flex items-center justify-between">
                  <span>✨ Add 1 more item for 10% routine savings!</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between text-base font-extrabold text-ink pt-2 border-t border-border-subtle">
                <span>Total</span>
                <span className="text-plum">{fmtPrice(cartTotal)}</span>
              </div>
              <p className="text-[11.5px] text-text-secondary text-center pt-1">
                Delivery charges will be calculated at checkout
              </p>
            </div>

            {/* Checkout Link */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-primary btn-block text-center font-bold"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
