"use client";

import { useState, useEffect } from "react";
import { supabase, Product, CATEGORIES, Category, fmt, isTenis } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("category")
      .order("id")
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = activeCategory === "todos"
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleQuickAdd = (product: Product) => {
    const size = isTenis(product.category) ? "42" : "M";
    addToCart(product, size);
    showToast(`✅ ${product.club} adicionado!`);
  };

  const handleModalAdd = (product: Product, size: string) => {
    addToCart(product, size);
    setSelectedProduct(null);
    showToast(`✅ ${product.club} (${size}) adicionado!`);
  };

  return (
    <section id="produtos" style={{ padding: "72px 5vw" }}>
      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "8px", display: "block" }}>
          Coleção
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "2px" }}>
          NOSSAS <span style={{ color: "var(--yellow)" }}>CAMISAS & TÊNIS</span>
        </h2>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
        {CATEGORIES.map(({ label, value }) => {
          const isTenisBtn = value === "tenis";
          const isActive = activeCategory === value;
          return (
            <button key={value} onClick={() => setActiveCategory(value)}
              style={{ background: isActive ? (isTenisBtn ? "rgba(0,87,183,0.85)" : "var(--green)") : "rgba(255,255,255,0.05)", border: `1px solid ${isActive ? (isTenisBtn ? "#0057b7" : "var(--green)") : "rgba(255,255,255,0.1)"}`, color: isActive ? "#fff" : "rgba(245,245,245,0.65)", padding: "7px 20px", borderRadius: "50px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", transition: "all .2s" }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Banner tênis */}
      {activeCategory === "tenis" && (
        <div style={{ background: "linear-gradient(135deg, rgba(0,57,127,0.3), rgba(0,87,183,0.15))", border: "1px solid rgba(0,87,183,0.3)", borderRadius: "14px", padding: "20px 28px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "2.5rem" }}>👟</span>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "2px", color: "#fff" }}>
              TÊNIS <span style={{ color: "#6baed6" }}>ESPORTIVOS</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.6)" }}>
              Nike, Adidas, Puma e New Balance — Numeração 36 ao 44
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "20px" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ background: "var(--dark2)", borderRadius: "12px", height: "320px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "20px" }}>
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={setSelectedProduct}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "rgba(245,245,245,0.4)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem" }}>Nenhum produto nessa categoria</div>
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleModalAdd}
        />
      )}
    </section>
  );
}
