"use client";

import { useEffect, useState } from "react";

const stats = [
  { value: "5.000+", label: "Clientes satisfeitos" },
  { value: "15.000+", label: "Camisas vendidas" },
  { value: "4.9", label: "Avaliação média" },
];

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        paddingTop: "108px", // Header + promo banner
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 80% at 70% 50%, rgba(10,140,42,0.16) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 5% 80%, rgba(0,87,183,0.12) 0%, transparent 60%),
            linear-gradient(180deg,#080808 0%,#0d0d0d 100%)
          `,
        }}
      />
      
      {/* Grass lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          background:
            "repeating-linear-gradient(90deg,transparent,transparent 40px,#0a8c2a 40px,#0a8c2a 80px)",
        }}
      />

      {/* Floating elements */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(10,140,42,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 5vw",
          maxWidth: "720px",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease-out",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(18,184,58,0.15)",
            border: "1px solid rgba(18,184,58,0.3)",
            borderRadius: "50px",
            padding: "6px 16px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--green-light)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--green-light)",
            }}
          >
            Nova coleção 24/25 disponível
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(3.5rem, 8vw, 6.5rem)",
            lineHeight: 0.92,
            letterSpacing: "2px",
            marginBottom: "18px",
          }}
        >
          <div style={{ color: "#fff" }}>VISTA</div>
          <div
            style={{
              background: "linear-gradient(90deg,#12b83a,#f5c800)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SUA PAIXÃO
          </div>
          <div style={{ color: "#0057b7" }}>PELO FUTEBOL</div>
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "rgba(245,245,245,0.7)",
            marginBottom: "32px",
            lineHeight: 1.7,
            maxWidth: "500px",
          }}
        >
          Camisas premium dos maiores clubes do mundo. Qualidade AAA+, tecido
          idêntico ao original. Entrega rápida para todo o Brasil.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "48px",
          }}
        >
          <a
            href="#produtos"
            style={{
              background: "linear-gradient(135deg,#0a8c2a,#12b83a)",
              color: "#fff",
              border: "none",
              padding: "16px 36px",
              borderRadius: "8px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 24px rgba(10,140,42,0.5)",
              transition: "all 0.3s ease",
            }}
            className="hover:scale-105 hover:shadow-[0_6px_32px_rgba(10,140,42,0.6)]"
          >
            VER CAMISAS
          </a>
          <a
            href="#ofertas"
            style={{
              background: "transparent",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.2)",
              padding: "14px 32px",
              borderRadius: "8px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "1px",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
            }}
            className="hover:border-green-500 hover:text-green-400"
          >
            VER OFERTAS
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2rem",
                  color: "var(--yellow)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(245,245,245,0.5)",
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: 0.5,
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Role para ver mais
        </span>
        <div
          style={{
            width: "24px",
            height: "40px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            paddingTop: "8px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "8px",
              background: "var(--green-light)",
              borderRadius: "2px",
              animation: "scrollBounce 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}
