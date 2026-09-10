'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, Product } from '@/lib/types';
import { BUNDLED_PRODUCTS, getProductById } from '@/lib/products';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  routineDiscountPct: number;
  routineSavings: number;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number | string, sourceEl?: HTMLElement | null) => void;
  addMultipleToCart: (productIds: (number | string)[], sourceEl?: HTMLElement | null, toastMessage?: string) => void;
  removeFromCart: (productId: number | string) => void;
  changeQty: (productId: number | string, delta: number) => void;
  clearCart: () => void;
  products: Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialProducts = BUNDLED_PRODUCTS,
}: {
  children: React.ReactNode;
  initialProducts?: Product[];
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cosmevo_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('cosmevo_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, isLoaded]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = getProductById(item.id, initialProducts);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
  }, [cart, initialProducts]);

  // Routine tiered savings:
  // 1 item: 0%
  // 2 items: 10%
  // 3 items: 13%
  // 4 items: 16% (limit 16% max in custom bundles)
  const routineDiscountPct = useMemo(() => {
    if (cartCount < 2) return 0;
    const rawPct = 10 + (cartCount - 2) * 3;
    return Math.min(16, rawPct);
  }, [cartCount]);

  const routineSavings = useMemo(() => {
    if (routineDiscountPct <= 0) return 0;
    return Math.round((cartSubtotal * routineDiscountPct) / 100);
  }, [cartSubtotal, routineDiscountPct]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - routineSavings);
  }, [cartSubtotal, routineSavings]);

  const triggerFlyAnimation = (sourceEl: HTMLElement) => {
    const cartIcon = document.getElementById('cartIconBtn');
    if (!cartIcon) return;

    const startRect = sourceEl.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    const dot = document.createElement('div');
    dot.className = 'fly-dot';
    dot.style.position = 'fixed';
    dot.style.width = '14px';
    dot.style.height = '14px';
    dot.style.background = '#791060';
    dot.style.borderRadius = '50%';
    dot.style.zIndex = '9997';
    dot.style.pointerEvents = 'none';
    dot.style.transform = 'translate(-50%, -50%)';
    dot.style.transition = 'left .6s cubic-bezier(.3,.6,.2,1), top .6s cubic-bezier(.3,.6,.2,1), transform .6s ease, opacity .6s ease';
    dot.style.left = `${startRect.left + startRect.width / 2}px`;
    dot.style.top = `${startRect.top + startRect.height / 2}px`;

    document.body.appendChild(dot);

    requestAnimationFrame(() => {
      dot.style.left = `${endRect.left + endRect.width / 2}px`;
      dot.style.top = `${endRect.top + endRect.height / 2}px`;
      dot.style.transform = 'translate(-50%, -50%) scale(0.2)';
      dot.style.opacity = '0';
    });

    setTimeout(() => {
      dot.remove();
      cartIcon.classList.add('animate-pulse-scale');
      setTimeout(() => cartIcon.classList.remove('animate-pulse-scale'), 400);
    }, 650);
  };

  const addToCart = (productId: number | string, sourceEl?: HTMLElement | null) => {
    setCart((prev) => {
      const existing = prev.find((item) => String(item.id) === String(productId));
      if (existing) {
        return prev.map((item) =>
          String(item.id) === String(productId) ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: productId, qty: 1 }];
    });

    if (sourceEl) {
      triggerFlyAnimation(sourceEl);
    }

    const product = getProductById(productId, initialProducts);
    if (product) {
      showToast(`${product.name} added to cart`);
    }
  };

  const addMultipleToCart = (
    productIds: (number | string)[],
    sourceEl?: HTMLElement | null,
    toastMessage?: string
  ) => {
    if (!productIds.length) return;

    setCart((prev) => {
      let nextCart = [...prev];
      productIds.forEach((pid) => {
        const idx = nextCart.findIndex((item) => String(item.id) === String(pid));
        if (idx >= 0) {
          nextCart[idx] = { ...nextCart[idx], qty: nextCart[idx].qty + 1 };
        } else {
          nextCart.push({ id: pid, qty: 1 });
        }
      });
      return nextCart;
    });

    if (sourceEl) {
      triggerFlyAnimation(sourceEl);
    }

    showToast(toastMessage || `${productIds.length} routine products added to cart`);
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prev) => prev.filter((item) => String(item.id) !== String(productId)));
  };

  const changeQty = (productId: number | string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => String(i.id) === String(productId));
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prev.filter((i) => String(i.id) !== String(productId));
      }
      return prev.map((i) =>
        String(i.id) === String(productId) ? { ...i, qty: newQty } : i
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        routineDiscountPct,
        routineSavings,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        changeQty,
        clearCart,
        products: initialProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
