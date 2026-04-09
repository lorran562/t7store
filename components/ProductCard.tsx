"use client";
import Link from "next/link";
import { Product, fmt, isTenis } from "@/lib/supabase";

interface Props {
  product: Product;
  onClick: (p: Product) => void;
  onQuickAdd: (p: Product) => void;
}

const badgeStyles: Record<string, { bg: string; color: string; label: string }> = {
  new:   { bg: "#12b83a", color: "#fff", label: "NOVO"   },
  sale:  { bg: "#e03c3c", color: "#fff", label: "OFERTA" },
  retro: { bg: "#f5c800", color: "#000", label: "RETRÔ"  },
};

export default function ProductCard({ product, onClick, onQuickAdd }: Props) {
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const tenis = isTenis(product.category);
  const accentColor = tenis ? "rgba(0,87,183,0.85)" : "var(--green)";

  return (
    <div style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", position: "relative", transition: "transform .2s, box-shadow .2s, border-color .2s", cursor: "pointer" }}
      className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500">
      {badge && (
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: "4px", background: badge.bg, color: badge.color }}>
          {discount > 0 ? `${discount}% OFF` : badge.label}
        </div>
      )}
      {tenis && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.68rem", padding: "3px 8px", borderRadius: "4px", background: "rgba(0,87,183,0.85)", color: "#fff" }}>
          TÊNIS
        </div>
      )}

      <Link href={`/produto/${product.id}`} style={{ textDecoration: "none" }} onClick={e => { e.preventDefault(); onClick(product); }}>
        <div style={{ width: "100%", height: "200px", background: product.image_url ? "var(--dark3)" : "linear-gradient(135deg,var(--dark3),#202020)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: "5.5rem" }}>{product.emoji}</span>}
        </div>
      </Link>

      <div style={{ padding: "16px" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>
          {product.club}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "3px" }}>{product.name}</div>
        <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.38)", marginBottom: "10px" }}>{product.meta}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {product.old_price && (
              <span style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.32)", textDecoration: "line-through", display: "block" }}>
                R$ {fmt(product.old_price)}
              </span>
            )}
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "var(--yellow)", lineHeight: 1 }}>
              R$ {fmt(product.price)}
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onQuickAdd(product); }}
            style={{ background: accentColor, border: "none", borderRadius: "8px", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", cursor: "pointer", color: "#fff" }}
            className="hover:brightness-110 hover:scale-110 transition-all">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
