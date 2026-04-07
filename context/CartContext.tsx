"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CartItem, Product, fmt } from "@/lib/data";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: string;
  isCartOpen: boolean;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (uid: number) => void;
  openCart: () => void;
  closeCart: () => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product, size: string) => {
    setCart((prev) => [...prev, { ...product, size, uid: Date.now() }]);
  }, []);

  const removeFromCart = useCallback((uid: number) => {
    setCart((prev) => prev.filter((x) => x.uid !== uid));
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.style.overflow = "";
  }, []);

  const checkout = useCallback(() => {
    if (!cart.length) return;
    const total = cart.reduce((s, x) => s + x.price, 0);
    const msg = encodeURIComponent(
      `Olá! Quero finalizar meu pedido T7 Store:\n\n${cart
        .map((i) => `• ${i.club} - ${i.name} (${i.size}) — R$ ${fmt(i.price)}`)
        .join("\n")}\n\n*TOTAL: R$ ${fmt(total)}*`
    );
    window.open(`https://wa.me/5500000000000?text=${msg}`, "_blank");
  }, [cart]);

  const cartCount = cart.length;
  const cartTotal = `R$ ${fmt(cart.reduce((s, x) => s + x.price, 0))}`;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, isCartOpen, addToCart, removeFromCart, openCart, closeCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
