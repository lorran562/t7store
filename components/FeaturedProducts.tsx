"use client";

import { products, Product, fmt } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import ProductModal from "./ProductModal";

const featured = products.filter(p => p.badge === "sale").slice(0, 4);
const bestSellers = products.slice(0, 4);

function ProductGrid({ title, subtitle, items, badgeBg, badgeText, bg }: {
  title: string; subtitle: string; items: Product[];
  badgeBg: string; badgeText: string; bg: string;
}) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <section style={{ padding: "64px 5vw", background: bg }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "8px", display: "block" }}>{subtitle}</span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "2px" }} dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {items.map(p => (
          <div key={p.id} onClick={() => setSelected(p)}
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", position: "relative" }}
            className="hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500">
            <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 3, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.72rem", letterSpacing: "1px", textTransform: "uppercase", padding: "4px 10px", borderRadius: "4px", background: badgeBg, color: "#fff" }}>
              {badgeText}
            </div>
            <div style={{ width: "100%", height: "180px", background: "linear-gradient(135deg, var(--dark3), #202020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4.5rem" }}>
              {p.emoji}
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "4px" }}>{p.club}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: "4px" }}>{p.name}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.38)", marginBottom: "12px" }}>{p.meta}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  {p.oldPrice && <span style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.32)", textDecoration: "line-through", display: "block" }}>R$ {fmt(p.oldPrice)}</span>}
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "var(--yellow)", lineHeight: 1 }}>R$ {fmt(p.price)}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); addToCart(p, "M"); showToast(`${p.club} adicionado!`); }}
                  style={{ background: "var(--green)", border: "none", borderRadius: "8px", width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", cursor: "pointer", color: "#fff" }}
                  className="hover:brightness-110 hover:scale-110">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={(p, s) => { addToCart(p, s); setSelected(null); showToast(`${p.club} (${s}) adicionado!`); }} />}
    </section>
  );
}

export default function FeaturedProducts() {
  return (
    <>
      <ProductGrid title={`OFERTAS DA <span style="color:var(--yellow)">SEMANA</span>`} subtitle="Aproveite os descontos" items={featured} badgeBg="#e03c3c" badgeText="ATÉ 20% OFF" bg="var(--dark2)" />
      <ProductGrid title={`MAIS <span style="color:var(--yellow)">VENDIDOS</span>`} subtitle="Os favoritos dos clientes" items={bestSellers} badgeBg="var(--green)" badgeText="TOP VENDAS" bg="var(--black)" />
    </>
  );
}
