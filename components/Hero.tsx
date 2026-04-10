"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <section style={{
      minHeight: "100svh", /* svh: respeita barra de endereço mobile */
      paddingTop: "var(--header-h)",
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_q2t918q2t918q2t9-Jm92SLTNSBSoHqGs2ErvDdidejLNFg.png"
          alt="" fill style={{ objectFit: "cover", objectPosition: "center" }} priority quality={85} unoptimized />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.65) 60%,rgba(0,0,0,0.4) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 40%,transparent 70%,rgba(0,0,0,0.6) 100%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "24px 16px 32px" }} className="hero-grid">
        {/* Texto */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "all .7s ease-out", display: "flex", flexDirection: "column" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(18,184,58,0.18)", border: "1px solid rgba(18,184,58,0.4)", borderRadius: "50px", padding: "6px 14px", marginBottom: "16px", width: "fit-content" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green-light)", boxShadow: "0 0 8px var(--green-light)", animation: "pulse 2s ease-in-out infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--green-light)" }}>
              Nova coleção 24/25
            </span>
          </div>

          {/* Título — responsivo */}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 9vw, 5rem)", lineHeight: 0.95, letterSpacing: "3px", marginBottom: "16px" }}>
            <div style={{ color: "#fff" }}>VISTA</div>
            <div style={{ background: "linear-gradient(90deg,#12b83a,#7fff00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px rgba(18,184,58,0.4))" }}>
              SUA PAIXÃO
            </div>
            <div style={{ color: "#fff" }}>PELO FUTEBOL</div>
          </h1>

          <p style={{ fontSize: "clamp(0.9rem,2.5vw,1.1rem)", color: "rgba(255,255,255,0.78)", marginBottom: "24px", lineHeight: 1.65, maxWidth: "480px" }}>
            Camisas dos maiores clubes do mundo. Qualidade AAA+, entrega rápida para todo o Brasil.
          </p>

          {/* CTAs — lado a lado no mobile também */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
            <a href="#produtos" style={{ background: "linear-gradient(135deg,#0a8c2a,#12b83a)", color: "#fff", border: "none", padding: "14px 28px", borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 900, fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 24px rgba(10,140,42,0.5)", minHeight: "52px" }}>
              ⚽ VER CAMISAS
            </a>
            <a href="#produtos" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", padding: "13px 24px", borderRadius: "10px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: "52px" }}>
              👟 TÊNIS
            </a>
          </div>


        </div>

        {/* Imagem da camisa — aparece só tablet+ */}
        <div style={{ display: "none", position: "relative", justifyContent: "center", alignItems: "center", opacity: visible ? 1 : 0, transition: "all 1s ease-out .3s" }} className="md:flex hero-jersey">
          <div style={{ position: "absolute", width: "70%", height: "70%", background: "radial-gradient(circle,rgba(18,184,58,0.35) 0%,transparent 70%)", filter: "blur(50px)", animation: "pulseGlow 3s ease-in-out infinite" }} />
          <div style={{ position: "relative", width: "100%", maxWidth: "440px", aspectRatio: "1", animation: "float 4s ease-in-out infinite" }}>
            <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_yubyj2yubyj2yuby-iuay7SAtUSXaCUydvveio2Wszs3aRn.png"
              alt="Camisa Premium" fill style={{ objectFit: "contain", filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))" }} priority quality={90} unoptimized />
          </div>
          {/* Floating badges */}
          <div style={{ position: "absolute", top: "12%", right: "4%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(18,184,58,0.3)", borderRadius: "10px", padding: "10px 14px", animation: "floatBadge 3s ease-in-out infinite" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--green-light)" }}>QUALIDADE</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>AAA+ Premium</div>
          </div>
          <div style={{ position: "absolute", bottom: "18%", left: "0%", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(245,200,0,0.3)", borderRadius: "10px", padding: "10px 14px", animation: "floatBadge 3s ease-in-out infinite 1s" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--yellow)" }}>FRETE GRÁTIS</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Acima de R$ 299</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — só no desktop */}
      <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", display: "none", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.55, zIndex: 3 }} className="md:flex">
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>Role</span>
        <div style={{ width: "24px", height: "38px", border: "2px solid rgba(255,255,255,0.35)", borderRadius: "12px", display: "flex", justifyContent: "center", paddingTop: "6px" }}>
          <div style={{ width: "3px", height: "8px", background: "var(--green-light)", borderRadius: "2px", animation: "scrollBounce 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}
