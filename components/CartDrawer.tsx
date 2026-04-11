"use client";
import { useCart } from "@/context/CartContext";
import { fmt } from "@/lib/supabase";

export default function CartDrawer() {
  const { cart, cartSubtotal, isCartOpen, closeCart, removeFromCart, updateQty, goToCheckout } = useCart();
  const shipping   = cartSubtotal >= 299 ? 0 : 29.90;
  const total      = cartSubtotal + shipping;
  const faltaFrete = 299 - cartSubtotal;

  return (
    <>
      <div onClick={closeCart} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 200, opacity: isCartOpen ? 1 : 0, pointerEvents: isCartOpen ? "all" : "none", transition: "opacity .3s" }} />

      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(390px,100vw)", background: "var(--dark2)", borderLeft: "1px solid rgba(255,255,255,0.07)", zIndex: 201, transform: isCartOpen ? "translateX(0)" : "translateX(100%)", transition: "transform .32s cubic-bezier(.4,0,.2,1)", display: "flex", flexDirection: "column", overscrollBehavior: "contain" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", letterSpacing: "2px" }}>🛒 CARRINHO</h3>
            {cart.length > 0 && <p style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.45)" }}>{cart.reduce((s, x) => s + x.qty, 0)} {cart.reduce((s, x) => s + x.qty, 0) === 1 ? "item" : "itens"}</p>}
          </div>
          <button onClick={closeCart} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", overscrollBehavior: "contain" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(245,245,245,0.3)" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>🛍️</div>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>Carrinho vazio.<br />Clique em um produto para adicionar!</p>
            </div>
          ) : cart.map(item => (
            <div key={item.uid} style={{ display: "flex", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: "60px", height: "60px", background: "var(--dark3)", borderRadius: "8px", flexShrink: 0, overflow: "hidden" }}>
                {item.image_url ? <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", opacity: 0.35 }}>{item.type === "tenis" ? "👟" : item.type === "bone" ? "🧢" : "⚽"}</div>}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "2px" }}>{item.club} — {item.name}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(245,245,245,0.38)", marginBottom: "8px" }}>
                  {[item.color, `${item.type === "tenis" ? "Nº" : "Tam."} ${item.size}`].filter(x => x && x.trim()).join(" · ")}
                </div>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: "8px", width: "fit-content", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <button onClick={() => item.qty === 1 ? removeFromCart(item.uid) : updateQty(item.uid, item.qty - 1)} style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#fff", fontSize: "1rem", cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.qty === 1 ? "🗑" : "−"}</button>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "#fff", minWidth: "32px", textAlign: "center", userSelect: "none" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.uid, item.qty + 1)} style={{ width: "32px", height: "32px", background: "transparent", border: "none", color: "#fff", fontSize: "1rem", cursor: "pointer", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--yellow)" }}>R$ {fmt(item.price * item.qty)}</div>
                {item.qty > 1 && <div style={{ fontSize: "0.68rem", color: "rgba(245,245,245,0.35)" }}>R$ {fmt(item.price)} × {item.qty}</div>}
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }} className="safe-bottom">
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "rgba(245,245,245,0.5)" }}>
                <span>Subtotal</span><span>R$ {fmt(cartSubtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: shipping === 0 ? "var(--green-light)" : "rgba(245,245,245,0.5)" }}>Frete</span>
                <span style={{ color: shipping === 0 ? "var(--green-light)" : "rgba(245,245,245,0.5)" }}>{shipping === 0 ? "Grátis 🎉" : `R$ ${fmt(shipping)}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.88rem", color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>Total</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--yellow)" }}>R$ {fmt(total)}</span>
              </div>
            </div>
            <button onClick={goToCheckout} style={{ width: "100%", background: "linear-gradient(135deg,#0a8c2a,#12b83a)", border: "none", padding: "16px", borderRadius: "12px", fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: "#fff", cursor: "pointer", boxShadow: "0 4px 20px rgba(10,140,42,0.4)", minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              FINALIZAR PEDIDO →
            </button>
            {faltaFrete > 0 && <p style={{ textAlign: "center", fontSize: "0.72rem", color: "rgba(245,245,245,0.35)", marginTop: "10px" }}>Faltam <strong style={{ color: "var(--yellow)" }}>R$ {fmt(faltaFrete)}</strong> para frete grátis</p>}
          </div>
        )}
      </div>
    </>
  );
}
