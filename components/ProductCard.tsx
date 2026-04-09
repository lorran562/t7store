import Link from "next/link";
import { Product, fmt } from "@/lib/data";

interface Props {
  product: Product;
  onClick: (p: Product) => void;
  onQuickAdd: (p: Product) => void;
}

const badgeStyles: Record<string, { background: string; color: string; label: string }> = {
  new:   { background: "#12b83a", color: "#fff", label: "NOVO"   },
  sale:  { background: "#e03c3c", color: "#fff", label: "OFERTA" },
  retro: { background: "#f5c800", color: "#000", label: "RETRÔ"  },
};

export default function ProductCard({ product, onClick, onQuickAdd }: Props) {
  const badge = product.badge ? badgeStyles[product.badge] : null;
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const isTenis = product.category === "tenis";

  return (
    <div
      style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform .2s, box-shadow .2s, border-color .2s", position: "relative" }}
      className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500"
    >
      {badge && (
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: "4px", background: badge.background, color: badge.color }}>
          {discount > 0 ? `${discount}% OFF` : badge.label}
        </div>
      )}
      {isTenis && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.68rem", letterSpacing: "1px", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", background: "rgba(0,87,183,0.85)", color: "#fff" }}>
          TÊNIS
        </div>
      )}

      <Link href={`/produto/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{ width: "100%", height: "200px", background: "linear-gradient(135deg,var(--dark3),#202020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5.5rem", position: "relative" }}>
          {product.emoji}
        </div>
      </Link>

      <div style={{ padding: "16px" }}>
        <Link href={`/produto/${product.id}`} style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: isTenis ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>
            {product.club}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "3px" }}>{product.name}</div>
          <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.38)", marginBottom: "10px" }}>{product.meta}</div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {product.oldPrice && (
              <span style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.32)", textDecoration: "line-through", display: "block" }}>
                R$ {fmt(product.oldPrice)}
              </span>
            )}
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "var(--yellow)", lineHeight: 1 }}>
              R$ {fmt(product.price)}
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onQuickAdd(product); }}
            style={{ background: isTenis ? "rgba(0,87,183,0.8)" : "var(--green)", border: "none", borderRadius: "8px", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", cursor: "pointer", color: "#fff" }}
            className="hover:brightness-110 hover:scale-110 transition-all">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
