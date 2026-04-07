"use client";

import { useState, useEffect } from "react";

const promos = [
  { icon: "📦", text: "FRETE GRÁTIS acima de R$ 299" },
  { icon: "💚", text: "5% OFF no PIX" },
  { icon: "🔒", text: "Compra 100% Segura" },
  { icon: "⚡", text: "Entrega em até 7 dias úteis" },
];

export default function PromoBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(90deg, var(--green-dark), var(--green))",
        padding: "10px 20px",
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        zIndex: 99,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.85rem",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#fff",
          animation: "fadeIn 0.3s ease",
        }}
        key={currentIndex}
      >
        <span style={{ fontSize: "1.1rem" }}>{promos[currentIndex].icon}</span>
        <span>{promos[currentIndex].text}</span>
      </div>
    </div>
  );
}
