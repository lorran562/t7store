"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CartItem, Product, fmt } from "@/lib/supabase";

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: string;
  cartSubtotal: number;
  isCartOpen: boolean;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (uid: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  goToCheckout: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product, size: string) => {
    setCart(prev => [...prev, { ...product, size, uid: Date.now() + Math.random() }]);
  }, []);

  const removeFromCart = useCallback((uid: number) => {
    setCart(prev => prev.filter(x => x.uid !== uid));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

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

  const cartSubtotal = cart.reduce((s, x) => s + x.price, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount: cart.length,
      cartTotal: `R$ ${fmt(cartSubtotal)}`,
      cartSubtotal,
      isCartOpen,
      addToCart,
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
