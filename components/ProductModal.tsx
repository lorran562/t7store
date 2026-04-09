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
  const sizes = product.sizes?.length ? product.sizes : getSizes(product.category);
  const hasImage = product.image_url && product.image_url.length > 0;
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", maxWidth: "620px", width: "100%", overflow: "hidden", position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", zIndex: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "1rem", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr" }}>
          {/* Imagem */}
          <div style={{ position: "relative", background: "var(--dark3)", aspectRatio: "1", overflow: "hidden" }}>
            {hasImage ? (
              <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div style={{ fontSize: "4rem", opacity: 0.3 }}>{tenis ? "👟" : "⚽"}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "2px" }}>SEM IMAGEM</div>
              </div>
            )}
            {discount > 0 && product.badge === "sale" && (
              <div style={{ position: "absolute", top: "12px", left: "12px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.75rem", padding: "5px 10px", borderRadius: "6px" }}>
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: "24px 24px 24px 22px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "4px" }}>
              {product.club}{tenis && " · 👟"}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: "4px", lineHeight: 1.2 }}>
              {product.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(245,245,245,0.42)", marginBottom: "4px" }}>{product.meta}</div>
            {product.description && (
              <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.35)", marginBottom: "12px", lineHeight: 1.5 }}>{product.description}</div>
            )}

            <div style={{ marginBottom: "12px" }}>
              {product.old_price && (
                <div style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.4)", textDecoration: "line-through" }}>
                  R$ {fmt(product.old_price)}
                </div>
              )}
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "var(--yellow)", lineHeight: 1 }}>
                R$ {fmt(product.price)}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(245,245,245,0.45)", display: "block", marginBottom: "8px" }}>
                {tenis ? "Numeração:" : "Tamanho:"}
              </span>
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                {sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    style={{ background: selectedSize === size ? (tenis ? "rgba(0,87,183,0.85)" : "var(--green)") : "rgba(255,255,255,0.05)", border: `1.5px solid ${selectedSize === size ? (tenis ? "#0057b7" : "var(--green)") : "rgba(255,255,255,0.1)"}`, color: selectedSize === size ? "#fff" : "rgba(245,245,245,0.65)", padding: "7px 12px", borderRadius: "7px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all .15s" }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => selectedSize && onAdd(product, selectedSize)}
              disabled={!selectedSize}
              style={{ marginTop: "auto", background: selectedSize ? (tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)") : "rgba(255,255,255,0.08)", border: "none", padding: "13px 20px", borderRadius: "10px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.92rem", letterSpacing: "2px", textTransform: "uppercase", color: selectedSize ? "#fff" : "rgba(255,255,255,0.3)", cursor: selectedSize ? "pointer" : "not-allowed", transition: "all .2s" }}
            >
              {selectedSize ? "🛒 ADICIONAR AO CARRINHO" : tenis ? "SELECIONE A NUMERAÇÃO" : "SELECIONE UM TAMANHO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
