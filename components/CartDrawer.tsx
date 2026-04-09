"use client";

import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/supabase";

export default function CartDrawer() {
  const { cart, cartTotal, isCartOpen, closeCart, removeFromCart, checkout } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 200, opacity: isCartOpen ? 1 : 0,
          pointerEvents: isCartOpen ? "all" : "none",
          transition: "opacity .3s",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "360px", maxWidth: "95vw",
          background: "var(--dark2)", borderLeft: "1px solid rgba(255,255,255,0.07)",
          zIndex: 201,
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform .3s cubic-bezier(.4,0,.2,1)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "2px" }}>
            🛒 CARRINHO
          </h3>
          <button
            onClick={closeCart}
            style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", width: "34px", height: "34px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 20px", color: "rgba(245,245,245,0.32)" }}>
              <span style={{ fontSize: "3rem", marginBottom: "12px", display: "block" }}>👕</span>
              <p style={{ fontSize: "0.88rem" }}>Carrinho vazio.<br />Adicione algumas camisas!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.uid} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
                <div style={{ width: "52px", height: "52px", background: "var(--dark3)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>
                    {item.club} — {item.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.38)", marginBottom: "4px" }}>
                    Tamanho: {item.size}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.05rem", color: "var(--yellow)" }}>
                    R$ {fmt(item.price)}
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.uid)}
                  style={{ background: "none", border: "none", color: "rgba(245,245,245,0.28)", cursor: "pointer", fontSize: "1rem" }}
                  className="hover:text-red-500 transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "18px 22px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.85rem", color: "rgba(245,245,245,0.55)" }}>
              TOTAL
            </span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.9rem", color: "var(--yellow)" }}>
              {cartTotal}
            </span>
          </div>
          <button
            onClick={checkout}
            style={{
              width: "100%", background: "linear-gradient(135deg,#0a8c2a,#12b83a)",
              border: "none", padding: "15px", borderRadius: "8px",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
              fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase",
              color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            💬 FINALIZAR PELO WHATSAPP
          </button>
        </div>
      </div>
    </>
  );
}
