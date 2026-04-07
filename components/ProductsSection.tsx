"use client";

import { useState } from "react";
import { products, CATEGORIES, Category, Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState<Category>("todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const filtered = activeCategory === "todos"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const handleQuickAdd = (product: Product) => {
    addToCart(product, "M");
    showToast(`✅ ${product.club} adicionado! (Tam. M)`);
  };

  const handleModalAdd = (product: Product, size: string) => {
    addToCart(product, size);
    setSelectedProduct(null);
    showToast(`✅ ${product.club} (${size}) adicionado!`);
  };

  return (
    <section id="produtos" style={{ padding: "72px 5vw" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "var(--green-light)", marginBottom: "8px", display: "block" }}>
          ⚽ Coleção
        </span>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,4vw,3rem)", letterSpacing: "2px" }}>
          NOSSAS <span style={{ color: "var(--yellow)" }}>CAMISAS</span>
        </h2>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            style={{
              background: activeCategory === value ? "var(--green)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${activeCategory === value ? "var(--green)" : "rgba(255,255,255,0.1)"}`,
              color: activeCategory === value ? "#fff" : "rgba(245,245,245,0.65)",
              padding: "7px 20px", borderRadius: "50px",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase",
              cursor: "pointer", transition: "all .2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "20px" }}>
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={setSelectedProduct}
            onQuickAdd={handleQuickAdd}
          />
        ))}
      </div>

      {/* Modal */}
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
