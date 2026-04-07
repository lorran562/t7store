"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount, openCart } = useCart();

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "2px solid var(--green)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5vw", height: "64px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Image
          src="/t7estore.jpg"
          alt="T7 Store"
          width={48}
          height={48}
          style={{ filter: "drop-shadow(0 0 8px rgba(18,184,58,0.5))", objectFit: "contain" }}
        />
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: "2px",
            background: "linear-gradient(135deg,#fff 30%,#f5c800)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}
        >
          T7 STORE
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex" style={{ gap: "1.8rem" }}>
        {["Produtos", "Contato"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.9rem", letterSpacing: "1px", textTransform: "uppercase",
              color: "var(--white)", textDecoration: "none",
            }}
            className="hover:text-yellow-400 transition-colors"
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Cart Button */}
      <button
        onClick={openCart}
        style={{
          background: "var(--green)", border: "none", borderRadius: "6px",
          padding: "8px 16px", fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: "0.9rem", letterSpacing: "1px",
          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
        }}
        className="hover:brightness-110 transition-all"
      >
        🛒 Carrinho
        <span
          style={{
            background: "var(--yellow)", color: "#000", borderRadius: "50%",
            width: "20px", height: "20px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.72rem", fontWeight: 900,
          }}
        >
          {cartCount}
        </span>
      </button>
    </header>
  );
}
