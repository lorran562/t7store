"use client";
import { useState } from "react";
import { Product, fmt, isTenis, getSizes } from "@/lib/supabase";

interface Props {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, size: string) => void;
}

export default function ProductModal({ product, onClose, onAdd }: Props) {
  const [selectedSize, setSelectedSize] = useState("");
  const tenis = isTenis(product.category);
  // Usa os sizes do banco se existirem, senão usa o padrão da categoria
  const sizes = product.sizes?.length ? product.sizes : getSizes(product.category);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", maxWidth: "560px", width: "100%", padding: "28px", position: "relative" }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer", width: "34px", height: "34px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ width: "160px", height: "160px", background: "var(--dark3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "4.5rem" }}>{product.emoji}</span>}
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>
              {product.club}{tenis && " · 👟 Tênis"}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: "3px" }}>{product.name}</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.42)", marginBottom: "8px" }}>{product.meta}</div>
            {product.old_price && (
              <div style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.4)", textDecoration: "line-through", marginBottom: "2px" }}>
                De R$ {fmt(product.old_price)}
              </div>
            )}
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "var(--yellow)", lineHeight: 1, marginBottom: "14px" }}>
              R$ {fmt(product.price)}
            </div>

            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(245,245,245,0.45)", marginBottom: "8px", display: "block" }}>
              {tenis ? "Numeração:" : "Tamanho:"}
            </span>
            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginBottom: "18px" }}>
              {sizes.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)}
                  style={{ background: selectedSize === size ? (tenis ? "rgba(0,87,183,0.8)" : "var(--green)") : "rgba(255,255,255,0.05)", border: `1px solid ${selectedSize === size ? (tenis ? "#0057b7" : "var(--green)") : "rgba(255,255,255,0.1)"}`, color: selectedSize === size ? "#fff" : "rgba(245,245,245,0.65)", padding: "7px 13px", borderRadius: "6px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                  {size}
                </button>
              ))}
            </div>

            <button onClick={() => selectedSize && onAdd(product, selectedSize)} disabled={!selectedSize}
              style={{ width: "100%", background: selectedSize ? (tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)") : "rgba(255,255,255,0.1)", border: "none", padding: "13px", borderRadius: "8px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.95rem", letterSpacing: "2px", textTransform: "uppercase", color: selectedSize ? "#fff" : "rgba(255,255,255,0.3)", cursor: selectedSize ? "pointer" : "not-allowed" }}>
              {selectedSize ? "🛒 ADICIONAR AO CARRINHO" : tenis ? "SELECIONE A NUMERAÇÃO" : "SELECIONE UM TAMANHO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
