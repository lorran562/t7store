"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Product, ColorGroup, SizeStock, fmt, isTenis, effectiveImage } from "@/lib/supabase";

interface Props {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, group: ColorGroup | null, size: string, qty: number) => void;
}

// Paleta de cores automática por nome
const COLOR_PALETTE: Record<string, string> = {
  vermelho: "#e03c3c", red: "#e03c3c",
  azul: "#0057b7", blue: "#0057b7", "azul claro": "#6baed6", "azulclaro": "#6baed6",
  branco: "#f0f0f0", white: "#f0f0f0",
  preto: "#222", black: "#222",
  verde: "#0a8c2a", green: "#0a8c2a",
  amarelo: "#f5c800", yellow: "#f5c800",
  laranja: "#ff7a00", orange: "#ff7a00",
  roxo: "#7b2d8b", purple: "#7b2d8b",
  rosa: "#e91e8c", pink: "#e91e8c",
  cinza: "#888", gray: "#888", grey: "#888",
  dourado: "#d4af37", gold: "#d4af37",
  prata: "#aaa", silver: "#aaa",
  marrom: "#6d4c41", brown: "#6d4c41",
  ciano: "#0097a7", cyan: "#0097a7",
  navy: "#003580",
};

function colorHex(name: string): string {
  return COLOR_PALETTE[name.toLowerCase().replace(/\s+/g, "")] || "#555";
}

export default function ProductModal({ product, onClose, onAdd }: Props) {
  const groups = product.colorGroups || [];
  const hasColors = groups.some(g => g.color !== "");

  const [activeGroup, setActiveGroup] = useState<ColorGroup | null>(groups[0] ?? null);
  const [size, setSize]   = useState("");
  const [qty,  setQty]    = useState(1);
  const [added, setAdded] = useState(false);
  const tenis = isTenis(product.type);

  // Tamanhos do grupo ativo, com estoque separado
  const availableSizes: SizeStock[] = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.sizes || [];
  }, [activeGroup]);

  const selectedSizeStock = availableSizes.find(s => s.size === size);
  const inStock = selectedSizeStock ? selectedSizeStock.stock > 0 : false;
  const maxQty  = selectedSizeStock?.stock ?? 99;

  // Resetar tamanho ao trocar cor
  useEffect(() => { setSize(""); setQty(1); }, [activeGroup]);

  // Fechar ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const displayImage = effectiveImage(product, activeGroup);
  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const handleAdd = useCallback(() => {
    if (!size || !inStock) return;
    onAdd(product, activeGroup, size, qty);
    setAdded(true);
    setTimeout(onClose, 800);
  }, [size, inStock, qty, product, activeGroup, onAdd, onClose]);

  const accent   = tenis ? "#0057b7" : "var(--green)";
  const gradient = tenis
    ? "linear-gradient(135deg,#003d99,#0057b7)"
    : "linear-gradient(135deg,#0a8c2a,#12b83a)";

  const canAdd = size && inStock && !added;

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
        {/* Handle mobile */}
        <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.18)", borderRadius: "2px", margin: "10px auto 0" }} className="sm:hidden" />

        {/* Fechar */}
        <button onClick={onClose}
          style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</button>

        {/* Imagem — troca ao mudar cor */}
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "var(--dark3)", position: "relative" }} className="sm:aspect-[4/3] sm:rounded-t-2xl">
          {displayImage ? (
            <img
              key={displayImage}
              src={displayImage}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity .25s" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", opacity: 0.2 }}>
              {tenis ? "👟" : "⚽"}
            </div>
          )}
          {discount > 0 && product.badge === "sale" && (
            <div style={{ position: "absolute", top: "12px", left: "12px", background: "#e03c3c", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.78rem", padding: "4px 10px", borderRadius: "6px" }}>
              -{discount}%
            </div>
          )}
          {/* Thumbnails de cores na imagem (se tem múltiplas cores) */}
          {hasColors && groups.length > 1 && (
            <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px" }}>
              {groups.map(g => (
                <button key={g.id} onClick={() => setActiveGroup(g)}
                  style={{ width: "8px", height: "8px", borderRadius: "50%", background: activeGroup?.id === g.id ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0 }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "20px 20px 28px" }}>
          {/* Header */}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>
            {product.club}
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#fff", lineHeight: 1.15, marginBottom: "3px" }}>
            {product.name}
          </h2>
          {product.meta && <p style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.4)", marginBottom: "14px" }}>{product.meta}</p>}

          {/* Preço */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
            {product.old_price && (
              <span style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.35)", textDecoration: "line-through" }}>R$ {fmt(product.old_price)}</span>
            )}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.1rem", color: "var(--yellow)", lineHeight: 1 }}>
              R$ {fmt(product.price)}
            </span>
          </div>

          {/* ── SELEÇÃO DE COR ── */}
          {hasColors && (
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
                <span style={{ color: "rgba(245,245,245,0.5)" }}>Cor</span>
                {activeGroup?.color && <span style={{ color: "#fff", marginLeft: "8px" }}>{activeGroup.color}</span>}
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {groups.map(g => {
                  const isActive = activeGroup?.id === g.id;
                  return (
                    <button key={g.id} onClick={() => setActiveGroup(g)} title={g.color}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                      {/* Swatch */}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: g.image_url ? `url(${g.image_url}) center/cover` : colorHex(g.color),
                        border: isActive ? "3px solid #fff" : "3px solid rgba(255,255,255,0.15)",
                        outline: isActive ? `2px solid ${accent}` : "none",
                        transition: "all .15s",
                        boxShadow: isActive ? "0 0 0 2px rgba(0,0,0,0.5)" : "none",
                        overflow: "hidden",
                      }} />
                      {/* Nome curto */}
                      {g.color && (
                        <span style={{ fontSize: "0.62rem", color: isActive ? "#fff" : "rgba(245,245,245,0.45)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "capitalize", maxWidth: "50px", textAlign: "center", lineHeight: 1.1 }}>
                          {g.color}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SELEÇÃO DE TAMANHO ── */}
          <div style={{ marginBottom: "18px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
              <span style={{ color: size ? "#fff" : "rgba(245,245,245,0.5)" }}>
                {tenis ? "Numeração" : "Tamanho"}
              </span>
              {!size && <span style={{ color: "#e03c3c", marginLeft: "4px" }}>*</span>}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {availableSizes.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.4)" }}>Sem tamanhos cadastrados</p>
              ) : availableSizes.map(({ size: s, stock }) => {
                const outOfStock = stock === 0;
                const isSelected = size === s;
                return (
                  <button key={s} onClick={() => !outOfStock && setSize(s)} disabled={outOfStock}
                    style={{
                      padding: "9px 16px", borderRadius: "8px",
                      border: `2px solid ${isSelected ? accent : outOfStock ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`,
                      background: isSelected ? accent : outOfStock ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                      color: isSelected ? "#fff" : outOfStock ? "rgba(245,245,245,0.22)" : "rgba(245,245,245,0.7)",
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem",
                      cursor: outOfStock ? "not-allowed" : "pointer",
                      minWidth: "50px", minHeight: "42px", textAlign: "center",
                      transition: "all .15s", position: "relative",
                      textDecoration: outOfStock ? "line-through" : "none",
                    }}>
                    {s}
                    {stock > 0 && stock <= 3 && (
                      <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "#f5c800", color: "#000", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                        {stock}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {availableSizes.length > 0 && !size && (
              <p style={{ fontSize: "0.7rem", color: "#e03c3c", marginTop: "6px" }}>
                Selecione {tenis ? "a numeração" : "um tamanho"}
              </p>
            )}
          </div>

          {/* Aviso estoque baixo */}
          {selectedSizeStock && selectedSizeStock.stock > 0 && selectedSizeStock.stock <= 3 && (
            <div style={{ background: "rgba(245,200,0,0.1)", border: "1px solid rgba(245,200,0,0.3)", borderRadius: "8px", padding: "8px 12px", marginBottom: "14px", fontSize: "0.78rem", color: "var(--yellow)" }}>
              ⚠️ Últimas {selectedSizeStock.stock} unidades!
            </div>
          )}

          {/* Quantidade */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,245,245,0.5)", marginBottom: "10px" }}>Quantidade</p>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", width: "fit-content", overflow: "hidden" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{ width: "46px", height: "46px", background: "transparent", border: "none", color: qty === 1 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "1.3rem", cursor: qty === 1 ? "not-allowed" : "pointer", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", minWidth: "50px", textAlign: "center", userSelect: "none" }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                style={{ width: "46px", height: "46px", background: "transparent", border: "none", color: qty >= maxQty ? "rgba(255,255,255,0.2)" : "#fff", fontSize: "1.3rem", cursor: qty >= maxQty ? "not-allowed" : "pointer", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>

          {/* Subtotal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "11px 16px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", color: "rgba(245,245,245,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>Subtotal</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "var(--yellow)" }}>
              R$ {fmt(product.price * qty)}
            </span>
          </div>

          {/* Botão principal */}
          <button onClick={handleAdd} disabled={!canAdd}
            style={{ width: "100%", background: added ? "rgba(18,184,58,0.3)" : canAdd ? gradient : "rgba(255,255,255,0.06)", border: added ? "1px solid var(--green)" : "none", padding: "16px", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", color: canAdd || added ? "#fff" : "rgba(255,255,255,0.25)", cursor: canAdd ? "pointer" : "not-allowed", minHeight: "54px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all .25s", boxShadow: canAdd ? (tenis ? "0 4px 20px rgba(0,87,183,0.4)" : "0 4px 20px rgba(10,140,42,0.4)") : "none" }}>
            {added ? "✅ ADICIONADO!" : !size ? (tenis ? "SELECIONE A NUMERAÇÃO" : "SELECIONE UM TAMANHO") : !inStock ? "SEM ESTOQUE" : `🛒 ADICIONAR · R$ ${fmt(product.price * qty)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
