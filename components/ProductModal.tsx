"use client";
import { useState, useEffect } from "react";
import { Product, fmt, isTenis, getSizes } from "@/lib/supabase";

interface Props {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, size: string) => void;
}

export default function ProductModal({ product, onClose, onAdd }: Props) {
  const [selected, setSelected] = useState("");
  const tenis = isTenis(product.category);
  const sizes = product.sizes?.length ? product.sizes : getSizes(product.category);
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  // Bloquear scroll do body quando modal aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fechar com ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0" }}
      className="sm:items-center sm:p-5"
    >
      {/* Modal — bottom sheet no mobile, centered no desktop */}
      <div style={{ background: "var(--dark2)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "620px", maxHeight: "92dvh", overflowY: "auto", position: "relative", boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}
        className="sm:rounded-2xl sm:max-h-[90vh]"
      >
        {/* Handle bar (mobile) */}
        <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", margin: "12px auto 0" }} className="sm:hidden" />

        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.9rem" }}
          aria-label="Fechar">✕</button>

        {/* Imagem + info: coluna no mobile, lado a lado no desktop */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr" }} className="sm:grid-cols-[200px_1fr]">
          {/* Imagem */}
          <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "var(--dark3)" }} className="sm:aspect-square">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", opacity: 0.3 }}>
                {tenis ? "👟" : "⚽"}
              </div>
            )}
            {discount > 0 && product.badge === "sale" && (
              <div style={{ position: "absolute", top: "10px", left: "10px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", padding: "4px 10px", borderRadius: "6px" }}>
                -{discount}%
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "4px" }}>
              {product.club}{tenis && " · 👟"}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff", marginBottom: "4px", lineHeight: 1.2 }}>
              {product.name}
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.42)", marginBottom: "12px" }}>{product.meta}</div>

            {/* Preço */}
            <div style={{ marginBottom: "16px" }}>
              {product.old_price && <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.4)", textDecoration: "line-through" }}>R$ {fmt(product.old_price)}</div>}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "var(--yellow)", lineHeight: 1 }}>R$ {fmt(product.price)}</div>
            </div>

            {/* Tamanhos */}
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(245,245,245,0.45)", display: "block", marginBottom: "8px" }}>
                {tenis ? "Numeração:" : "Tamanho:"}
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelected(size)}
                    style={{ background: selected === size ? (tenis ? "rgba(0,87,183,0.9)" : "var(--green)") : "rgba(255,255,255,0.06)", border: `1.5px solid ${selected === size ? (tenis ? "#0057b7" : "var(--green)") : "rgba(255,255,255,0.12)"}`, color: selected === size ? "#fff" : "rgba(245,245,245,0.7)", padding: "9px 14px", borderRadius: "8px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", minHeight: "44px", transition: "all .15s" }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão add */}
            <button onClick={() => selected && onAdd(product, selected)} disabled={!selected}
              style={{ background: selected ? (tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)") : "rgba(255,255,255,0.08)", border: "none", padding: "15px 20px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: selected ? "#fff" : "rgba(255,255,255,0.3)", cursor: selected ? "pointer" : "not-allowed", minHeight: "52px", transition: "all .2s" }}>
              {selected ? "🛒 ADICIONAR AO CARRINHO" : tenis ? "SELECIONE A NUMERAÇÃO" : "SELECIONE UM TAMANHO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
