"use client";

import { products, Product, fmt } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import ProductModal from "./ProductModal";

const featured = products.filter((p) => p.badge === "sale").slice(0, 4);
const bestSellers = products.slice(0, 4);

interface ProductGridProps {
  title: string;
  subtitle: string;
  items: Product[];
  badge?: { text: string; color: string; bg: string };
}

function ProductGrid({ title, subtitle, items, badge }: ProductGridProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, "M");
    showToast(`${product.club} adicionado! (Tam. M)`);
  };

  const handleModalAdd = (product: Product, size: string) => {
    addToCart(product, size);
    setSelectedProduct(null);
    showToast(`${product.club} (${size}) adicionado!`);
  };

  return (
    <section style={{ padding: "64px 5vw" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "var(--green-light)",
            marginBottom: "8px",
            display: "block",
          }}
        >
          {subtitle}
        </span>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "2px",
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {items.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
            }}
            className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500"
          >
            {/* Badge */}
            {badge && (
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  zIndex: 3,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: "0.72rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  background: badge.bg,
                  color: badge.color,
                }}
              >
                {badge.text}
              </div>
            )}

            {/* Stock badge */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 3,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.5px",
                padding: "4px 8px",
                borderRadius: "4px",
                background: "rgba(224,60,60,0.9)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: "0.6rem" }}>🔥</span>
              Últimas unidades
            </div>

            {/* Image */}
            <div
              style={{
                width: "100%",
                height: "180px",
                background: "linear-gradient(135deg, var(--dark3), #202020)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4.5rem",
              }}
            >
              {product.emoji}
            </div>

            {/* Info */}
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--green-light)",
                  marginBottom: "4px",
                }}
              >
                {product.club}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                {product.name}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(245,245,245,0.38)",
                  marginBottom: "12px",
                }}
              >
                {product.meta}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  {product.oldPrice && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(245,245,245,0.32)",
                        textDecoration: "line-through",
                        display: "block",
                      }}
                    >
                      R$ {fmt(product.oldPrice)}
                    </span>
                  )}
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.5rem",
                      color: "var(--yellow)",
                      lineHeight: 1,
                    }}
                  >
                    R$ {fmt(product.price)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--green-light)",
                      fontWeight: 600,
                    }}
                  >
                    ou 3x de R$ {fmt(product.price / 3)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleQuickAdd(product, e)}
                  style={{
                    background: "var(--green)",
                    border: "none",
                    borderRadius: "8px",
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                    color: "#fff",
                    transition: "all 0.2s",
                  }}
                  className="hover:brightness-110 hover:scale-110"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

export function OfferOfTheWeek() {
  return (
    <ProductGrid
      title="OFERTAS DA <span style='color: var(--yellow)'>SEMANA</span>"
      subtitle="Aproveite os descontos"
      items={featured}
      badge={{ text: "ATÉ 20% OFF", bg: "#e03c3c", color: "#fff" }}
    />
  );
}

export function BestSellers() {
  return (
    <ProductGrid
      title="MAIS <span style='color: var(--yellow)'>VENDIDOS</span>"
      subtitle="Os favoritos dos clientes"
      items={bestSellers}
      badge={{ text: "TOP VENDAS", bg: "var(--green)", color: "#fff" }}
    />
  );
}

export default function FeaturedProducts() {
  return (
    <>
      <section style={{ padding: "64px 5vw", background: "var(--dark2)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--green-light)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Aproveite os descontos
          </span>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "2px",
            }}
          >
            OFERTAS DA <span style={{ color: "var(--yellow)" }}>SEMANA</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <FeaturedCard items={featured} badgeText="ATÉ 20% OFF" badgeBg="#e03c3c" />
        </div>
      </section>

      <section style={{ padding: "64px 5vw", background: "var(--black)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--green-light)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Os favoritos dos clientes
          </span>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "2px",
            }}
          >
            MAIS <span style={{ color: "var(--yellow)" }}>VENDIDOS</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <FeaturedCard items={bestSellers} badgeText="TOP VENDAS" badgeBg="var(--green)" />
        </div>
      </section>
    </>
  );
}

function FeaturedCard({
  items,
  badgeText,
  badgeBg,
}: {
  items: Product[];
  badgeText: string;
  badgeBg: string;
}) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, "M");
    showToast(`${product.club} adicionado! (Tam. M)`);
  };

  const handleModalAdd = (product: Product, size: string) => {
    addToCart(product, size);
    setSelectedProduct(null);
    showToast(`${product.club} (${size}) adicionado!`);
  };

  return (
    <>
      {items.map((product) => (
        <div
          key={product.id}
          onClick={() => setSelectedProduct(product)}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
          }}
          className="group hover:-translate-y-1.5 hover:shadow-2xl hover:border-green-500"
        >
          {/* Badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              zIndex: 3,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "0.72rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "4px",
              background: badgeBg,
              color: "#fff",
            }}
          >
            {badgeText}
          </div>

          {/* Stock indicator */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 3,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.68rem",
              letterSpacing: "0.5px",
              padding: "4px 8px",
              borderRadius: "4px",
              background: "rgba(224,60,60,0.9)",
              color: "#fff",
            }}
          >
            Últimas unidades
          </div>

          {/* Image */}
          <div
            style={{
              width: "100%",
              height: "180px",
              background: "linear-gradient(135deg, var(--dark3), #202020)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4.5rem",
            }}
          >
            {product.emoji}
          </div>

          {/* Info */}
          <div style={{ padding: "16px" }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--green-light)",
                marginBottom: "4px",
              }}
            >
              {product.club}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "rgba(245,245,245,0.38)",
                marginBottom: "12px",
              }}
            >
              {product.meta}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                {product.oldPrice && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(245,245,245,0.32)",
                      textDecoration: "line-through",
                      display: "block",
                    }}
                  >
                    R$ {fmt(product.oldPrice)}
                  </span>
                )}
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.5rem",
                    color: "var(--yellow)",
                    lineHeight: 1,
                  }}
                >
                  R$ {fmt(product.price)}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--green-light)",
                    fontWeight: 600,
                  }}
                >
                  ou 3x de R$ {fmt(product.price / 3)}
                </div>
              </div>
              <button
                onClick={(e) => handleQuickAdd(product, e)}
                style={{
                  background: "var(--green)",
                  border: "none",
                  borderRadius: "8px",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
                className="hover:brightness-110 hover:scale-110"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleModalAdd}
        />
      )}
    </>
  );
}
