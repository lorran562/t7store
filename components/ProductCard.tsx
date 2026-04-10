"use client";
import { Product, fmt, isTenis } from "@/lib/supabase";

interface Props {
  product: Product;
  onOpenModal: (p: Product) => void;
}

const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  new:   { bg: "#12b83a", color: "#fff", label: "NOVO"   },
  sale:  { bg: "#e03c3c", color: "#fff", label: "OFERTA" },
  retro: { bg: "#f5c800", color: "#000", label: "RETRÔ"  },
};

function Placeholder({ category }: { category: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: isTenis(category) ? "linear-gradient(135deg,#0a1628,#0d1e3d)" : "linear-gradient(135deg,#0a1a0a,#0d2e12)" }}>
      <span style={{ fontSize: "clamp(2rem,8vw,3rem)", opacity: 0.22 }}>{isTenis(category) ? "👟" : "⚽"}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>Sem imagem</span>
    </div>
  );
}

export default function ProductCard({ product, onOpenModal }: Props) {
  const badge    = product.badge ? BADGE[product.badge] : null;
  const discount = product.old_price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;
  const tenis    = isTenis(product.category);
  const hasImg   = Boolean(product.image_url);

  return (
    <article
      onClick={() => onOpenModal(product)}
      style={{
        background: "var(--dark2)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        WebkitTapHighlightColor: "transparent",
      }}
      className="group hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)] hover:border-white/20 active:scale-[0.98]"
    >
      {/* Badge desconto */}
      {badge && (
        <div style={{ position: "absolute", top: "8px", left: "8px", zIndex: 3, fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase", padding: "3px 8px", borderRadius: "5px", background: badge.bg, color: badge.color, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
          {discount > 0 ? `-${discount}%` : badge.label}
        </div>
      )}
      {tenis && (
        <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 3, fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "0.6rem", padding: "3px 7px", borderRadius: "4px", background: "rgba(0,87,183,0.9)", color: "#fff" }}>TÊNIS</div>
      )}

      {/* Imagem quadrada */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "var(--dark3)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {hasImg ? (
            <img
              src={product.image_url}
              alt={`${product.club} ${product.name}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s ease" }}
              className="group-hover:scale-105"
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <Placeholder category={product.category} />
          )}
        </div>

        {/* Overlay "Ver produto" no hover */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .25s" }} className="group-hover:bg-black/30">
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "0.85rem", letterSpacing: "2px", color: "#fff", background: "rgba(0,0,0,0.7)", padding: "8px 16px", borderRadius: "8px", opacity: 0, transition: "opacity .25s", border: "1px solid rgba(255,255,255,0.2)" }} className="group-hover:opacity-100">
            VER PRODUTO
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: tenis ? "#6baed6" : "var(--green-light)", marginBottom: "3px" }}>
          {product.club}
        </div>

        {/* Nome — máx 2 linhas */}
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(0.82rem,2.5vw,0.95rem)", color: "#fff", lineHeight: 1.2, marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
          {product.name}
        </div>

        {/* Preço + CTA */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", marginTop: "auto" }}>
          <div>
            {product.old_price && (
              <div style={{ fontSize: "0.68rem", color: "rgba(245,245,245,0.32)", textDecoration: "line-through", lineHeight: 1 }}>
                R$ {fmt(product.old_price)}
              </div>
            )}
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem,4vw,1.5rem)", color: "var(--yellow)", lineHeight: 1 }}>
              R$ {fmt(product.price)}
            </div>
          </div>

          {/* Botão — abre modal (não adiciona direto) */}
          <div
            style={{
              background: tenis ? "rgba(0,87,183,0.85)" : "var(--green)",
              borderRadius: "9px",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "1.4rem",
              color: "#fff",
              transition: "transform .15s, filter .15s",
            }}
            className="group-hover:brightness-110 group-hover:scale-105"
          >
            +
          </div>
        </div>
      </div>
    </article>
  );
}
