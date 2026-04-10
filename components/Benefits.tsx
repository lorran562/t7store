const benefits = [
  {
    icon: "👕",
    title: "Qualidade Premium",
    description: "Tecido AAA+ idêntico ao original, costuras reforçadas e acabamento impecável.",
  },
  {
    icon: "🚚",
    title: "Entrega Rápida",
    description: "Enviamos para todo Brasil com rastreamento. Frete grátis acima de R$ 299.",
  },
  {
    icon: "🔒",
    title: "Compra Segura",
    description: "Pagamento protegido via Pix, cartão ou boleto. Seus dados sempre seguros.",
  },
  {
    icon: "💬",
    title: "Suporte Dedicado",
    description: "Atendimento humanizado via WhatsApp. Tire dúvidas antes e depois da compra.",
  },
];

export default function Benefits() {
  return (
    <section
      style={{
        padding: "64px 5vw",
        background: "linear-gradient(180deg, var(--dark2) 0%, var(--black) 100%)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "var(--green-light)",
            marginBottom: "8px",
            display: "block",
          }}
        >
          Por que escolher a T7?
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "2px",
          }}
        >
          CONFIANÇA DE <span style={{ color: "var(--yellow)" }}>+5.000 CLIENTES</span>
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "28px 24px",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
            className="hover:border-green-500/30 hover:bg-white/[0.04]"
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "16px",
                filter: "drop-shadow(0 0 12px rgba(18,184,58,0.3))",
              }}
            >
              {benefit.icon}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "1.1rem",
                letterSpacing: "1px",
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              {benefit.title}
            </h3>
            <p
              style={{
                fontSize: "0.88rem",
                color: "rgba(245,245,245,0.55)",
                lineHeight: 1.6,
              }}
            >
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
