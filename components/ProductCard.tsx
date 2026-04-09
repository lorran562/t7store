"use client";
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

// Placeholder bonito quando não há imagem
function ImagePlaceholder({ category }: { category: string }) {
  const tenis = isTenis(category);
  return (
    <div style={{
      width: "100%", height: "100%",
      background: tenis
        ? "linear-gradient(135deg, #0a1628 0%, #0d1e3d 50%, #0a1628 100%)"
        : "linear-gradient(135deg, #0a1a0a 0%, #0d2e12 50%, #0a1a0a 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
    }}>
      <div style={{ fontSize: "3.5rem", opacity: 0.35 }}>{tenis ? "👟" : "⚽"}</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
        SEM IMAGEM
      </div>
    </div>
  );
}

export default function ProductCard({ product, onClick, onQuickAdd }: Props) {
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const tenis = isTenis(product.category);
  const hasImage = product.image_url && product.image_url.length > 0;

  return (
    <div
      onClick={() => onClick(product)}
      style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", position: "relative", cursor: "pointer", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }}
      className="group hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20"
    >
      {/* Badges */}
      {badge && (
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", padding: "5px 11px", borderRadius: "6px", background: badge.bg, color: badge.color, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
          {discount > 0 ? `${discount}% OFF` : badge.label}
        </div>
      )}
      {tenis && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.68rem", padding: "4px 9px", borderRadius: "5px", background: "rgba(0,87,183,0.9)", color: "#fff" }}>
          TÊNIS
        </div>
      )}

      {/* Imagem — proporção quadrada, zoom no hover */}
      <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", position: "relative", background: "var(--dark3)" }}>
        {hasImage ? (
          <img
            src={product.image_url}
            alt={`${product.club} ${product.name}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s ease" }}
            className="group-hover:scale-105"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.style.background = "var(--dark3)"; }}
          />
        ) : (
          <ImagePlaceholder category={product.category} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "4px" }}>
          {product.club}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "3px", lineHeight: 1.2 }}>
          {product.name}
        </div>
        <div style={{ fontSize: "0.76rem", color: "rgba(245,245,245,0.38)", marginBottom: "14px" }}>
          {product.meta}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {product.old_price && (
              <span style={{ fontSize: "0.73rem", color: "rgba(245,245,245,0.32)", textDecoration: "line-through", display: "block", lineHeight: 1 }}>
                R$ {fmt(product.old_price)}
              </span>
            )}
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "var(--yellow)", lineHeight: 1 }}>
              R$ {fmt(product.price)}
            </div>
          </div>

          <button
            onClick={e => { e.stopPropagation(); onQuickAdd(product); }}
            style={{ background: tenis ? "rgba(0,87,183,0.85)" : "var(--green)", border: "none", borderRadius: "10px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", cursor: "pointer", color: "#fff", transition: "all .2s ease", flexShrink: 0 }}
            className="hover:brightness-110 hover:scale-105"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
