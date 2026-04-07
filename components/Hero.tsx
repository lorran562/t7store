export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh", paddingTop: "64px",
        display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute", inset: 0,
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
          position: "absolute", inset: 0, opacity: 0.03,
          background: "repeating-linear-gradient(90deg,transparent,transparent 40px,#0a8c2a 40px,#0a8c2a 80px)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 5vw", maxWidth: "680px" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(3.5rem,8vw,6.5rem)",
            lineHeight: 0.92, letterSpacing: "2px", marginBottom: "18px",
          }}
        >
          <div style={{ color: "#fff" }}>VISTA</div>
          <div
            style={{
              background: "linear-gradient(90deg,#12b83a,#f5c800)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            SUA PAIXÃO
          </div>
          <div style={{ color: "#0057b7" }}>PELO FUTEBOL</div>
        </h1>

        <p style={{ fontSize: "1rem", color: "rgba(245,245,245,0.6)", marginBottom: "30px", lineHeight: 1.6, maxWidth: "460px" }}>
          Camisas dos maiores clubes nacionais e internacionais. Entrega rápida para todo o Brasil.
        </p>

        <a
          href="#produtos"
          style={{
            background: "linear-gradient(135deg,#0a8c2a,#12b83a)",
            color: "#fff", border: "none", padding: "13px 30px", borderRadius: "6px",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: "1rem", letterSpacing: "2px", textTransform: "uppercase" as const,
            cursor: "pointer", textDecoration: "none", display: "inline-flex",
            alignItems: "center", gap: "8px",
            boxShadow: "0 4px 20px rgba(10,140,42,0.4)",
          }}
        >
          ⚽ Ver Camisas
        </a>
      </div>
    </section>
  );
}
