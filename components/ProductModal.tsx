"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Product, ProductVariation, fmt, isTenis, getColors, findVariation, effectivePrice, effectiveImage } from "@/lib/supabase";

interface Props {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, variation: ProductVariation | null, size: string, color: string, qty: number) => void;
}

// Paleta de cores para swatches (nome → hex)
const COLOR_HEX: Record<string, string> = {
  vermelho: "#e03c3c", azul: "#0057b7", azulclaro: "#6baed6", branco: "#f5f5f5",
  preto: "#1a1a1a", verde: "#0a8c2a", amarelo: "#f5c800", laranja: "#ff7a00",
  roxo: "#7b2d8b", rosa: "#e91e8c", cinza: "#888", dourado: "#d4af37",
  prata: "#aaa", ciano: "#0097a7", marrom: "#6d4c41",
};

function colorHex(name: string): string {
  const key = name.toLowerCase().replace(/\s/g, "");
  return COLOR_HEX[key] || "#555";
}

export default function ProductModal({ product, onClose, onAdd }: Props) {
  const variations = product.variations || [];
  const colors     = useMemo(() => getColors(variations), [variations]);
  const hasColors  = colors.length > 0;

  const [color, setColor] = useState(colors[0] ?? "");
  const [size,  setSize]  = useState("");
  const [qty,   setQty]   = useState(1);
  const [added, setAdded] = useState(false);

  const tenis = isTenis(product.type);

  // Tamanhos disponíveis para a cor selecionada (com estoque > 0)
  const availableSizes = useMemo(() => {
    if (variations.length === 0) return product.sizes || [];
    const relevant = hasColors
      ? variations.filter(v => v.color === color || v.color === "")
      : variations;
    return Array.from(new Set(relevant.filter(v => v.stock > 0).map(v => v.size)));
  }, [variations, color, hasColors, product.sizes]);

  // Variação selecionada
  const selectedVariation = useMemo(() =>
    findVariation(variations, color, size), [variations, color, size]);

  // Resetar tamanho ao trocar cor
  useEffect(() => { setSize(""); }, [color]);

  // ESC para fechar
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const displayImage = effectiveImage(product, selectedVariation);
  const displayPrice = effectivePrice(product, selectedVariation);
  const inStock      = selectedVariation ? selectedVariation.stock > 0 : true;

  const handleAdd = useCallback(() => {
    if (!size || !inStock) return;
    onAdd(product, selectedVariation ?? null, size, color, qty);
    setAdded(true);
    setTimeout(onClose, 800);
  }, [size, inStock, color, qty, product, selectedVariation, onAdd, onClose]);

  const accent   = tenis ? "#0057b7" : "var(--green)";
  const gradient = tenis ? "linear-gradient(135deg,#003d99,#0057b7)" : "linear-gradient(135deg,#0a8c2a,#12b83a)";
  const discount = product.old_price ? Math.round(((product.old_price - displayPrice) / product.old_price) * 100) : 0;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}
      className="sm:items-center sm:p-4"
    >
      <div
        style={{ background: "var(--dark2)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "560px", maxHeight: "94dvh", overflowY: "auto", position: "relative", boxShadow: "0 -12px 48px rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
        className="sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.18)", borderRadius: "2px", margin: "10px auto 0" }} className="sm:hidden" />

        {/* Fechar */}
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</button>

        {/* Imagem */}
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "var(--dark3)", flexShrink: 0, position: "relative" }} className="sm:aspect-[4/3] sm:rounded-t-2xl">
          {displayImage ? (
            <img src={displayImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .3s" }} key={displayImage} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", opacity: 0.2 }}>{tenis ? "👟" : "⚽"}</div>
          )}
          {discount > 0 && product.badge === "sale" && (
            <div style={{ position: "absolute", top: "12px", left: "12px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.78rem", padding: "4px 10px", borderRadius: "6px" }}>-{discount}%</div>
          )}
        </div>

        <div style={{ padding: "20px 20px 28px" }}>
          {/* Clube + nome */}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>{product.club}</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#fff", lineHeight: 1.15, marginBottom: "3px" }}>{product.name}</h2>
          {product.meta && <p style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.4)", marginBottom: "12px" }}>{product.meta}</p>}

          {/* Preço */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
            {product.old_price && <span style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.35)", textDecoration: "line-through" }}>R$ {fmt(product.old_price)}</span>}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.1rem", color: "var(--yellow)", lineHeight: 1 }}>R$ {fmt(displayPrice)}</span>
          </div>

          {/* Cor */}
          {hasColors && (
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.5)", marginBottom: "10px" }}>
                Cor{color && <span style={{ color: "#fff", marginLeft: "6px" }}>{color}</span>}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setColor(c)} title={c}
                    style={{ width: "34px", height: "34px", borderRadius: "50%", background: colorHex(c), border: color === c ? "3px solid #fff" : "3px solid transparent", outline: color === c ? `2px solid ${accent}` : "2px solid transparent", cursor: "pointer", transition: "all .15s", boxShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tamanho */}
          <div style={{ marginBottom: "18px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: size ? "#fff" : "rgba(245,245,245,0.5)", marginBottom: "10px" }}>
              {tenis ? "Numeração" : "Tamanho"}
              {!size && <span style={{ color: "#e03c3c", marginLeft: "4px" }}>*</span>}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {availableSizes.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  style={{ padding: "9px 16px", borderRadius: "8px", border: `2px solid ${size === s ? accent : "rgba(255,255,255,0.12)"}`, background: size === s ? accent : "rgba(255,255,255,0.04)", color: size === s ? "#fff" : "rgba(245,245,245,0.7)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", minWidth: "50px", minHeight: "42px", textAlign: "center", transition: "all .15s" }}>
                  {s}
                </button>
              ))}
              {availableSizes.length === 0 && <p style={{ fontSize: "0.82rem", color: "#ff6b6b" }}>Sem estoque disponível</p>}
            </div>
            {!size && availableSizes.length > 0 && <p style={{ fontSize: "0.7rem", color: "#e03c3c", marginTop: "6px" }}>Selecione {tenis ? "a numeração" : "um tamanho"}</p>}
          </div>

          {/* Estoque aviso */}
          {selectedVariation && selectedVariation.stock <= 3 && (
            <div style={{ background: "rgba(245,200,0,0.1)", border: "1px solid rgba(245,200,0,0.3)", borderRadius: "8px", padding: "8px 12px", marginBottom: "14px", fontSize: "0.78rem", color: "var(--yellow)" }}>
              ⚠️ Últimas {selectedVariation.stock} unidades!
            </div>
          )}

          {/* Quantidade */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.5)", marginBottom: "10px" }}>Quantidade</p>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", width: "fit-content", overflow: "hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: "46px", height: "46px", background: "transparent", border: "none", color: qty === 1 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "1.3rem", cursor: qty === 1 ? "not-allowed" : "pointer", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", minWidth: "50px", textAlign: "center", userSelect: "none" }}>{qty}</span>
              <button onClick={() => setQty(q => selectedVariation ? Math.min(selectedVariation.stock, q + 1) : q + 1)} style={{ width: "46px", height: "46px", background: "transparent", border: "none", color: "#fff", fontSize: "1.3rem", cursor: "pointer", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>

          {/* Subtotal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "11px 16px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", color: "rgba(245,245,245,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>Subtotal</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "var(--yellow)" }}>R$ {fmt(displayPrice * qty)}</span>
          </div>

          {/* Botão */}
          <button
            onClick={handleAdd}
            disabled={!size || !inStock || added}
            style={{ width: "100%", background: added ? "rgba(18,184,58,0.3)" : (!size || !inStock) ? "rgba(255,255,255,0.06)" : gradient, border: added ? "1px solid var(--green)" : "none", padding: "16px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: (!size || !inStock) && !added ? "rgba(255,255,255,0.25)" : "#fff", cursor: (size && inStock && !added) ? "pointer" : "not-allowed", minHeight: "54px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all .25s", boxShadow: (size && inStock && !added) ? (tenis ? "0 4px 20px rgba(0,87,183,0.4)" : "0 4px 20px rgba(10,140,42,0.4)") : "none" }}
          >
            {added ? "✅ ADICIONADO!" : !size ? (tenis ? "SELECIONE A NUMERAÇÃO" : "SELECIONE UM TAMANHO") : !inStock ? "SEM ESTOQUE" : `🛒 ADICIONAR · R$ ${fmt(displayPrice * qty)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
