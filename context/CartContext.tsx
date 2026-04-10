"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem, Product, ProductVariation, fmt, effectivePrice, effectiveImage } from "@/lib/supabase";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: string;
  cartSubtotal: number;
  isCartOpen: boolean;
  addToCart: (product: Product, variation: ProductVariation | null, size: string, color: string, qty?: number) => void;
  removeFromCart: (uid: number) => void;
  updateQty: (uid: number, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  goToCheckout: () => void;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "t7store_cart_v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }, [cart, hydrated]);

  const addToCart = useCallback((
    product: Product,
    variation: ProductVariation | null,
    size: string,
    color: string,
    qty = 1
  ) => {
    const price = effectivePrice(product, variation);
    const image_url = effectiveImage(product, variation);
    setCart(prev => {
      const key = `${product.id}-${variation?.id ?? "none"}-${size}-${color}`;
      const idx = prev.findIndex(x =>
        x.product_id === product.id &&
        x.variation_id === (variation?.id ?? null) &&
        x.size === size && x.color === color
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      const item: CartItem = {
        uid: Date.now() + Math.random(),
        product_id: product.id,
        variation_id: variation?.id ?? null,
        club: product.club,
        brand: product.brand || product.club,
        name: product.name,
        category: product.category,
        type: product.type,
        color,
        size,
        price,
        image_url,
        qty,
      };
      return [...prev, item];
    });
  }, []);

  const updateQty = useCallback((uid: number, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(x => x.uid === uid ? { ...x, qty } : x));
  }, []);

  const removeFromCart = useCallback((uid: number) => {
    setCart(prev => prev.filter(x => x.uid !== uid));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.style.overflow = "";
  }, []);

  const goToCheckout = useCallback(() => {
    setIsCartOpen(false);
    document.body.style.overflow = "";
    window.location.href = "/checkout";
  }, []);

  const cartSubtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const cartCount    = cart.reduce((s, x) => s + x.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, cartCount,
      cartTotal: `R$ ${fmt(cartSubtotal)}`,
      cartSubtotal, isCartOpen,
      addToCart, updateQty, removeFromCart, clearCart,
      openCart, closeCart, goToCheckout,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
