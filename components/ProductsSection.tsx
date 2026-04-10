"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase, Product, ProductVariation, CATEGORIES, Category } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

function SkeletonCard() {
  return (
    <div style={{ background: "var(--dark2)", borderRadius: "12px", overflow: "hidden" }}>
      <div className="skeleton" style={{ width: "100%", paddingBottom: "100%" }} />
      <div style={{ padding: "10px 12px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="skeleton" style={{ height: "10px", width: "45%", borderRadius: "4px" }} />
        <div className="skeleton" style={{ height: "13px", width: "80%", borderRadius: "4px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          <div className="skeleton" style={{ height: "22px", width: "38%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ width: "44px", height: "44px", borderRadius: "9px" }} />
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState<Category>("todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const { addToCart, openCart } = useCart();
  const { showToast }           = useToast();

  useEffect(() => {
    async function load() {
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("category").order("id");

      if (!prods) { setLoading(false); return; }

      const { data: vars } = await supabase
        .from("product_variations")
        .select("*")
        .in("product_id", prods.map(p => p.id));

      const varsByProduct: Record<number, ProductVariation[]> = {};
      (vars || []).forEach(v => {
        if (!varsByProduct[v.product_id]) varsByProduct[v.product_id] = [];
        varsByProduct[v.product_id].push(v);
      });

      setProducts(prods.map(p => ({ ...p, variations: varsByProduct[p.id] || [] })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = category === "todos" ? products : products.filter(p => p.category === category);

  const handleAdd = useCallback((
    product: Product,
    variation: ProductVariation | null,
    size: string,
    color: string,
    qty: number
  ) => {
    addToCart(product, variation, size, color, qty);
    setSelected(null);
    const varInfo = [color, size].filter(Boolean).join(" / ");
    showToast(`✅ ${product.club} · ${varInfo}${qty > 1 ? ` ×${qty}` : ""}`);
    setTimeout(openCart, 400);
  }, [addToCart, openCart, showToast]);

  return (
    <section id="produtos" style={{ padding: "48px 16px 64px" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "var(--green-light)", display: "block", marginBottom: "8px" }}>Coleção</span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,5vw,2.8rem)", letterSpacing: "2px" }}>
          CAMISAS & <span style={{ color: "var(--yellow)" }}>TÊNIS</span>
        </h2>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "24px", scrollSnapType: "x mandatory" }} className="no-scrollbar">
        {CATEGORIES.map(({ label, value }) => {
          const isActive = category === value;
          const isTenisBtn = value === "tenis";
          return (
            <button key={value} onClick={() => setCategory(value)}
              style={{ background: isActive ? (isTenisBtn ? "rgba(0,87,183,0.9)" : "var(--green)") : "rgba(255,255,255,0.06)", border: `1px solid ${isActive ? (isTenisBtn ? "#0057b7" : "var(--green)") : "rgba(255,255,255,0.1)"}`, color: isActive ? "#fff" : "rgba(245,245,245,0.65)", padding: "8px 16px", borderRadius: "50px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, scrollSnapAlign: "start", minHeight: "38px", transition: "all .2s" }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="products-grid">
        {loading
          ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          : filtered.map(p => <ProductCard key={p.id} product={p} onOpenModal={setSelected} />)
        }
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(245,245,245,0.38)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem" }}>Nenhum produto nessa categoria</div>
        </div>
      )}

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={handleAdd} />
      )}
    </section>
  );
}
