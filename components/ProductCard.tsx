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

  return (
    <div
      onClick={() => onClick(product)}
      style={{
        background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px", overflow: "hidden", cursor: "pointer",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        position: "relative",
      }}
      className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500"
    >
      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute", top: "12px", left: "12px", zIndex: 3,
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase",
            padding: "3px 9px", borderRadius: "4px",
            background: badge.background, color: badge.color,
          }}
        >
          {badge.label}
        </div>
      )}

      {/* Image area */}
      <div
        style={{
          width: "100%", height: "200px",
          background: "linear-gradient(135deg,var(--dark3),#202020)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "5.5rem",
        }}
      >
        {product.emoji}
      </div>

      {/* Info */}
      <div style={{ padding: "16px" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "3px" }}>
          {product.club}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "3px" }}>
          {product.name}
        </div>
        <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.38)", marginBottom: "12px" }}>
          {product.meta}
        </div>
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
          <button
            onClick={(e) => { e.stopPropagation(); onQuickAdd(product); }}
            style={{
              background: "var(--green)", border: "none", borderRadius: "8px",
              width: "38px", height: "38px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1.3rem", cursor: "pointer",
              color: "#fff",
            }}
            className="hover:brightness-110 hover:scale-110 transition-all"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
