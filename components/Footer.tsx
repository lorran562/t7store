const payments = ["PIX", "VISA", "MASTER", "BOLETO"];

export default function Footer() {
  return (
    <footer
      id="contato"
      style={{
        background: "#050505",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "36px 5vw 24px",
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "3px",
          background: "linear-gradient(135deg,#fff 30%,#f5c800)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: "8px",
        }}
      >
        T7 STORE
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
        {[
          { label: "💬 WhatsApp", href: "https://wa.me/5500000000000" },
          { label: "📧 contato@t7store.com", href: "mailto:contato@t7store.com" },
          { label: "📷 Instagram", href: "#" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.85rem", letterSpacing: "1px",
              color: "rgba(245,245,245,0.45)", textDecoration: "none",
            }}
            className="hover:text-green-400 transition-colors"
          >
            {label}
          </a>
        ))}
      </div>

      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "12px",
          borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "18px",
        }}
      >
        <p style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.28)" }}>
          © 2025 T7 Store. Todos os direitos reservados.
        </p>
        <div style={{ display: "flex", gap: "7px" }}>
          {payments.map((p) => (
            <div
              key={p}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "4px", padding: "4px 9px", fontSize: "0.68rem",
                color: "rgba(245,245,245,0.45)", fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, letterSpacing: "1px",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
