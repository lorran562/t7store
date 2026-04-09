"use client";
import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/supabase";

export default function CartDrawer() {
  const { cart, cartTotal, isCartOpen, closeCart, removeFromCart, checkout } = useCart();

  return (
    <>
      {/* Overlay */}
      <div onClick={closeCart} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 200, opacity: isCartOpen ? 1 : 0, pointerEvents: isCartOpen ? "all" : "none", transition: "opacity .3s" }} />

      {/* Drawer — lateral no desktop, bottom sheet em telas muito pequenas */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(380px, 100vw)",
        background: "var(--dark2)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        zIndex: 201,
        transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform .32s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
        overscrollBehavior: "contain",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "2px" }}>🛒 CARRINHO</h3>
            {cart.length > 0 && <p style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.45)" }}>{cart.length} {cart.length === 1 ? "item" : "itens"}</p>}
          </div>
          <button onClick={closeCart} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.9rem" }} aria-label="Fechar carrinho">✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", overscrollBehavior: "contain" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(245,245,245,0.3)" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>🛍️</div>
              <p style={{ fontSize: "0.88rem" }}>Carrinho vazio.<br />Adicione produtos!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.uid} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
                <div style={{ width: "56px", height: "56px", background: "var(--dark3)", borderRadius: "8px", flexShrink: 0, overflow: "hidden" }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", opacity: 0.4 }}>
                      {item.category === "tenis" ? "👟" : "⚽"}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.club} — {item.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.38)", marginBottom: "4px" }}>
                    {item.category === "tenis" ? "Nº" : "Tam."} {item.size}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "var(--yellow)" }}>
                    R$ {fmt(item.price)}
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.uid)}
                  style={{ background: "none", border: "none", color: "rgba(245,245,245,0.28)", cursor: "pointer", padding: "8px", flexShrink: 0, minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", borderRadius: "8px" }}
                  className="hover:text-red-400 hover:bg-white/5 transition-colors"
                  aria-label="Remover item">✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }} className="safe-bottom">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.85rem", color: "rgba(245,245,245,0.55)" }}>TOTAL</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "var(--yellow)" }}>{cartTotal}</span>
          </div>
          <button onClick={checkout} disabled={cart.length === 0}
            style={{ width: "100%", background: cart.length ? "linear-gradient(135deg,#0a8c2a,#12b83a)" : "rgba(255,255,255,0.08)", border: "none", padding: "16px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: cart.length ? "pointer" : "not-allowed", boxShadow: cart.length ? "0 4px 20px rgba(10,140,42,0.4)" : "none", minHeight: "52px" }}>
            💬 FINALIZAR PELO WHATSAPP
          </button>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(245,245,245,0.3)", marginTop: "10px" }}>Frete grátis acima de R$ 299</p>
        </div>
      </div>
    </>
  );
}
