"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
        paddingTop: "108px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image with Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_q2t918q2t918q2t9-Jm92SLTNSBSoHqGs2ErvDdidejLNFg.png"
          alt="Background"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority
          quality={90}
        />
        {/* Dark overlay for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%),
              linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)
            `,
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 5vw",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "40px",
        }}
        className="hero-grid"
      >
        {/* Left side - Text */}
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease-out",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(18,184,58,0.2)",
              border: "1px solid rgba(18,184,58,0.4)",
              borderRadius: "50px",
              padding: "8px 18px",
              marginBottom: "28px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--green-light)",
                boxShadow: "0 0 10px var(--green-light)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.82rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "var(--green-light)",
              }}
            >
              Nova colecao 24/25 disponivel
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              lineHeight: 0.95,
              letterSpacing: "3px",
              marginBottom: "24px",
            }}
          >
            <div style={{ color: "#fff", textShadow: "0 0 40px rgba(0,0,0,0.5)" }}>VISTA</div>
            <div
              style={{
                background: "linear-gradient(90deg,#12b83a,#7fff00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(18,184,58,0.5))",
              }}
            >
              SUA PAIXAO
            </div>
            <div style={{ color: "#fff", textShadow: "0 0 40px rgba(0,0,0,0.5)" }}>PELO FUTEBOL</div>
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "36px",
              lineHeight: 1.7,
              maxWidth: "480px",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            Camisas premium dos maiores clubes do mundo. Qualidade AAA+, tecido
            identico ao original. Entrega rapida para todo o Brasil.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: "16px",
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
                padding: "18px 40px",
                borderRadius: "8px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "1.05rem",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 30px rgba(10,140,42,0.6), 0 0 60px rgba(10,140,42,0.3)",
                transition: "all 0.3s ease",
              }}
              className="hover:scale-105 hover:shadow-[0_6px_40px_rgba(10,140,42,0.8)]"
            >
              VER CAMISAS
            </a>
            <a
              href="#ofertas"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "17px 36px",
                borderRadius: "8px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase" as const,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              className="hover:border-green-400 hover:bg-green-500/10 hover:text-green-400"
            >
              VER OFERTAS
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              flexWrap: "wrap",
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "2.2rem",
                    color: "var(--green-light)",
                    lineHeight: 1,
                    textShadow: "0 0 20px rgba(18,184,58,0.5)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - 3D Jersey */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(40px)",
            transition: "all 1s ease-out 0.3s",
          }}
          className="hero-jersey"
        >
          {/* Glow effect behind jersey */}
          <div
            style={{
              position: "absolute",
              width: "80%",
              height: "80%",
              background: "radial-gradient(circle, rgba(18,184,58,0.4) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "pulseGlow 3s ease-in-out infinite",
            }}
          />
          
          {/* Jersey image */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              aspectRatio: "1",
              animation: "float 4s ease-in-out infinite",
            }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_yubyj2yubyj2yuby-iuay7SAtUSXaCUydvveio2Wszs3aRn.png"
              alt="Camisa Premium T7 Store"
              fill
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.5))",
              }}
              priority
              quality={95}
            />
          </div>

          {/* Floating badges around jersey */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "5%",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(18,184,58,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
              animation: "floatBadge 3s ease-in-out infinite",
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "var(--green-light)" }}>
              QUALIDADE
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>AAA+ Premium</div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "15%",
              left: "0%",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(245,200,0,0.3)",
              borderRadius: "12px",
              padding: "12px 16px",
              animation: "floatBadge 3s ease-in-out infinite 1s",
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "var(--yellow)" }}>
              FRETE GRATIS
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>Acima de R$ 199</div>
          </div>
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
          opacity: 0.6,
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          Role para ver mais
        </span>
        <div
          style={{
            width: "26px",
            height: "42px",
            border: "2px solid rgba(255,255,255,0.4)",
            borderRadius: "13px",
            display: "flex",
            justifyContent: "center",
            paddingTop: "8px",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "10px",
              background: "var(--green-light)",
              borderRadius: "2px",
              boxShadow: "0 0 10px var(--green-light)",
              animation: "scrollBounce 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          
          .hero-jersey {
            order: -1;
            max-width: 350px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
