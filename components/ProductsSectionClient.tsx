"use client";

import { useState } from "react";
import { DbProduct } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import ProductModal from "./ProductModal";
import { Product, fmt } from "@/lib/data";

const CATEGORIES = [
  { label: "Todos",          value: "todos"          },
  { label: "Nacionais",      value: "nacional"       },
  { label: "Internacionais", value: "internacional"  },
  { label: "Seleções",       value: "selecao"        },
  { label: "Retrô",          value: "retro"          },
];

const badgeStyles: Record<string, { background: string; color: string; label: string }> = {
  new:   { background: "#12b83a", color: "#fff", label: "NOVO"   },
  sale:  { background: "#e03c3c", color: "#fff", label: "OFERTA" },
  retro: { background: "#f5c800", color: "#000", label: "RETRÔ"  },
};

function dbToProduct(p: DbProduct): Product {
  return {
    id: p.id,
    emoji: p.emoji,
    club: p.club,
    name: p.name,
    meta: p.meta,
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : null,
    badge: p.badge as Product["badge"],
    category: p.category as Product["category"],
  };
}

export default function ProductsSectionClient({ products }: { products: DbProduct[] }) {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const filtered = activeCategory === "todos"
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleQuickAdd = (p: DbProduct) => {
    addToCart(dbToProduct(p), "M");
    showToast(`✅ ${p.club} adicionado! (Tam. M)`);
  };

  const handleModalAdd = (p: Product, size: string) => {
    addToCart(p, size);
    setSelectedProduct(null);
    showToast(`✅ ${p.club} (${size}) adicionado!`);
  };

  return (
    <section id="produtos" style={{ padding: "72px 5vw" }}>
      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "8px", display: "block" }}>
          ⚽ Coleção
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "2px" }}>
          NOSSAS <span style={{ color: "var(--yellow)" }}>CAMISAS</span>
        </h2>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
        {CATEGORIES.map(({ label, value }) => (
          <button key={value} onClick={() => setActiveCategory(value)}
            style={{ background: activeCategory === value ? "var(--green)" : "rgba(255,255,255,0.05)", border: `1px solid ${activeCategory === value ? "var(--green)" : "rgba(255,255,255,0.1)"}`, color: activeCategory === value ? "#fff" : "rgba(245,245,245,0.65)", padding: "7px 20px", borderRadius: "50px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "20px" }}>
        {filtered.map(p => {
          const badge = p.badge ? badgeStyles[p.badge] : null;
          return (
            <div key={p.id} onClick={() => setSelectedProduct(dbToProduct(p))}
              style={{ background: "var(--dark2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform .2s, box-shadow .2s, border-color .2s", position: "relative" }}
              className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500">
              {badge && (
                <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", padding: "3px 9px", borderRadius: "4px", background: badge.background, color: badge.color }}>
                  {badge.label}
                </div>
              )}
              <div style={{ width: "100%", height: "200px", background: "linear-gradient(135deg,var(--dark3),#202020)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "5.5rem" }}>{p.emoji}</span>}
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "3px" }}>{p.club}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "3px" }}>{p.name}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.38)", marginBottom: "12px" }}>{p.meta}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    {p.old_price && <span style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.32)", textDecoration: "line-through", display: "block" }}>R$ {fmt(Number(p.old_price))}</span>}
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "var(--yellow)", lineHeight: 1 }}>R$ {fmt(Number(p.price))}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleQuickAdd(p); }}
                    style={{ background: "var(--green)", border: "none", borderRadius: "8px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", cursor: "pointer", color: "#fff" }}
                    className="hover:brightness-110 hover:scale-110 transition-all">
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={handleModalAdd} />
      )}
    </section>
  );
}
