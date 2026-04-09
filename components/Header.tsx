"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Fecha menu ao clicar em link
  const handleNav = () => setMenuOpen(false);

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(8,8,8,0.98)" : "rgba(8,8,8,0.95)",
        backdropFilter: "blur(14px)",
        borderBottom: "2px solid var(--green)",
        height: "var(--header-h)",
        display: "flex", alignItems: "center",
        padding: "0 16px",
        gap: "12px",
        transition: "background .3s",
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
          <Image src="/t7estore.jpg" alt="T7 Store" width={36} height={36} style={{ objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(18,184,58,0.5))" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "2px", background: "linear-gradient(135deg,#fff 30%,#f5c800)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>
            T7 STORE
          </span>
        </a>

        {/* Nav desktop */}
        <nav style={{ flex: 1, display: "flex", justifyContent: "center", gap: "1.6rem" }} className="hidden md:flex">
          {["Produtos", "Contato"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.88rem", letterSpacing: "1px", textTransform: "uppercase", color: "var(--white)", textDecoration: "none" }}
              className="hover:text-yellow-400 transition-colors">
              {item}
            </a>
          ))}
        </nav>

        {/* Direita: carrinho + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          {/* Botão carrinho — sempre visível */}
          <button onClick={openCart} style={{ background: "var(--green)", border: "none", borderRadius: "8px", padding: "8px 14px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", minHeight: "40px" }}
            className="hover:brightness-110 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span style={{ background: "var(--yellow)", color: "#000", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900, flexShrink: 0, lineHeight: 1 }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — só mobile */}
          <button onClick={() => setMenuOpen(m => !m)}
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", width: "40px", height: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px", cursor: "pointer", flexShrink: 0 }}
            className="flex md:hidden"
            aria-label="Menu">
            <span style={{ width: "18px", height: "2px", background: menuOpen ? "var(--yellow)" : "#fff", borderRadius: "2px", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none", transition: "all .25s" }} />
            <span style={{ width: "18px", height: "2px", background: "#fff", borderRadius: "2px", opacity: menuOpen ? 0 : 1, transition: "opacity .2s" }} />
            <span style={{ width: "18px", height: "2px", background: menuOpen ? "var(--yellow)" : "#fff", borderRadius: "2px", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none", transition: "all .25s" }} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{ position: "fixed", top: "var(--header-h)", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 99 }} onClick={() => setMenuOpen(false)}>
          <nav style={{ background: "var(--dark2)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 0" }} onClick={e => e.stopPropagation()}>
            {[{ label: "Produtos", href: "#produtos" }, { label: "Contato", href: "#contato" }].map(item => (
              <a key={item.label} href={item.href} onClick={handleNav}
                style={{ display: "block", padding: "16px 24px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "1px", textTransform: "uppercase", color: "#fff", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                className="hover:bg-white/5">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
