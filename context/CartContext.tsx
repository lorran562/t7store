"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CartItem, Product, fmt } from "@/lib/supabase";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: string;
  cartSubtotal: number;
  isCartOpen: boolean;
  addToCart: (product: Product, size: string, qty?: number) => void;
  removeFromCart: (uid: number) => void;
  updateQty: (uid: number, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  goToCheckout: () => void;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "t7store_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata do localStorage uma única vez
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persiste sempre que o carrinho muda (após hidratação)
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  }, [cart, hydrated]);

  const addToCart = useCallback((product: Product, size: string, qty = 1) => {
    setCart(prev => {
      // Se já existe o mesmo produto+tamanho, incrementa
      const idx = prev.findIndex(x => x.id === product.id && x.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + qty };
        return next;
      }
      return [...prev, { ...product, size, qty, uid: Date.now() + Math.random() }];
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
    // Usa router push para preservar o estado
    window.location.href = "/checkout";
  }, []);

  const cartSubtotal = cart.reduce((s, x) => s + x.price * (x.qty || 1), 0);
  const cartCount = cart.reduce((s, x) => s + (x.qty || 1), 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal: `R$ ${fmt(cartSubtotal)}`,
      cartSubtotal,
      isCartOpen,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      goToCheckout,
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
