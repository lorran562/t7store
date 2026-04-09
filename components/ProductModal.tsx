"use client";
import { useState, useEffect, useCallback } from "react";
import { Product, fmt, isTenis, getSizes } from "@/lib/supabase";

interface Props {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, size: string, qty: number) => void;
}

export default function ProductModal({ product, onClose, onAdd }: Props) {
  const [size, setSize]   = useState("");
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);
  const tenis   = isTenis(product.category);
  const sizes   = product.sizes?.length ? product.sizes : getSizes(product.category);
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  // Fechar com ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleAdd = useCallback(() => {
    if (!size) return;
    onAdd(product, size, qty);
    setAdded(true);
    // Fecha após breve feedback
    setTimeout(onClose, 800);
  }, [size, qty, product, onAdd, onClose]);

  const accent  = tenis ? "#0057b7" : "var(--green)";
  const gradient = tenis
    ? "linear-gradient(135deg,#003d99,#0057b7)"
    : "linear-gradient(135deg,#0a8c2a,#12b83a)";

  return (
    /* Overlay */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0, backdropFilter: "blur(4px)" }}
      className="sm:items-center sm:p-4"
    >
      {/* Sheet */}
      <div
        style={{ background: "var(--dark2)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "540px", maxHeight: "92dvh", overflowY: "auto", position: "relative", boxShadow: "0 -12px 48px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
        className="sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.18)", borderRadius: "2px", margin: "10px auto 0" }} className="sm:hidden" />

        {/* Fechar */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.85rem" }}
          aria-label="Fechar"
        >✕</button>

        {/* Imagem */}
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "var(--dark3)", flexShrink: 0 }} className="sm:aspect-square sm:rounded-t-2xl">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", opacity: 0.25 }}>
              {tenis ? "👟" : "⚽"}
            </div>
          )}
          {discount > 0 && product.badge === "sale" && (
            <div style={{ position: "absolute", top: "14px", left: "14px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.78rem", padding: "4px 10px", borderRadius: "6px" }}>
              -{discount}%
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div style={{ padding: "20px 20px 24px" }}>
          {/* Título */}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "4px" }}>
            {product.club}
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#fff", lineHeight: 1.15, marginBottom: "4px" }}>
            {product.name}
          </h2>
          <p style={{ fontSize: "0.8rem", color: "rgba(245,245,245,0.42)", marginBottom: "14px" }}>{product.meta}</p>

          {/* Preço */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
            {product.old_price && (
              <span style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.35)", textDecoration: "line-through" }}>
                R$ {fmt(product.old_price)}
              </span>
            )}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "var(--yellow)", lineHeight: 1 }}>
              R$ {fmt(product.price)}
            </span>
          </div>

          {/* Tamanho */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase", color: size ? "#fff" : "rgba(245,245,245,0.5)", marginBottom: "10px" }}>
              {tenis ? "Numeração" : "Tamanho"}
              {!size && <span style={{ color: "#e03c3c", marginLeft: "4px" }}>*</span>}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: `2px solid ${size === s ? accent : "rgba(255,255,255,0.12)"}`,
                    background: size === s ? accent : "rgba(255,255,255,0.04)",
                    color: size === s ? "#fff" : "rgba(245,245,245,0.7)",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    minWidth: "52px",
                    minHeight: "44px",
                    textAlign: "center",
                    transition: "all .15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {!size && (
              <p style={{ fontSize: "0.72rem", color: "#e03c3c", marginTop: "6px" }}>
                Selecione {tenis ? "a numeração" : "um tamanho"} para continuar
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div style={{ marginBottom: "22px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.5)", marginBottom: "10px" }}>
              Quantidade
            </p>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", width: "fit-content", overflow: "hidden" }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: "48px", height: "48px", background: "transparent", border: "none", color: qty === 1 ? "rgba(255,255,255,0.25)" : "#fff", fontSize: "1.3rem", cursor: qty === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.08)", transition: "all .15s" }}
              >−</button>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", minWidth: "52px", textAlign: "center", userSelect: "none" }}>
                {qty}
              </span>
              <button
                onClick={() => setQty(q => q + 1)}
                style={{ width: "48px", height: "48px", background: "transparent", border: "none", color: "#fff", fontSize: "1.3rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.08)", transition: "all .15s" }}
              >+</button>
            </div>
          </div>

          {/* Subtotal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.8rem", color: "rgba(245,245,245,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>Subtotal</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "var(--yellow)" }}>
              R$ {fmt(product.price * qty)}
            </span>
          </div>

          {/* Botão principal */}
          <button
            onClick={handleAdd}
            disabled={!size || added}
            style={{
              width: "100%",
              background: added
                ? "rgba(18,184,58,0.3)"
                : size ? gradient : "rgba(255,255,255,0.06)",
              border: added ? "1px solid var(--green)" : "none",
              padding: "16px 20px",
              borderRadius: "12px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: size || added ? "#fff" : "rgba(255,255,255,0.3)",
              cursor: size && !added ? "pointer" : "not-allowed",
              minHeight: "54px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all .25s",
              boxShadow: size && !added ? (tenis ? "0 4px 20px rgba(0,87,183,0.4)" : "0 4px 20px rgba(10,140,42,0.4)") : "none",
            }}
          >
            {added ? (
              <>✅ ADICIONADO!</>
            ) : !size ? (
              tenis ? "SELECIONE A NUMERAÇÃO" : "SELECIONE UM TAMANHO"
            ) : (
              <>🛒 ADICIONAR AO CARRINHO · R$ {fmt(product.price * qty)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
