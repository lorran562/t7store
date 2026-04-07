const testimonials = [
  {
    name: "Lucas M.",
    location: "São Paulo, SP",
    rating: 5,
    text: "Qualidade absurda! Comprei a do Flamengo e parece a original. Entrega super rápida, 5 dias úteis. Com certeza compro de novo!",
    product: "Flamengo I 24/25",
    avatar: "L",
  },
  {
    name: "Amanda R.",
    location: "Rio de Janeiro, RJ",
    rating: 5,
    text: "Terceira compra na T7, sempre entregam o que prometem. Atendimento pelo WhatsApp foi excelente, tiraram todas as dúvidas.",
    product: "Seleção Brasileira I",
    avatar: "A",
  },
  {
    name: "Rafael S.",
    location: "Belo Horizonte, MG",
    rating: 5,
    text: "Presenteei meu pai com a camisa retrô do Palmeiras 93. Ele amou! Acabamento perfeito e embalagem premium. Super recomendo!",
    product: "Palmeiras Retrô 1993",
    avatar: "R",
  },
  {
    name: "Carla F.",
    location: "Curitiba, PR",
    rating: 5,
    text: "A camisa do Barcelona chegou antes do prazo! Material de primeira, costuras perfeitas. Melhor loja de camisas online.",
    product: "Barcelona I 24/25",
    avatar: "C",
  },
];

export default function Testimonials() {
  return (
    <section
      style={{
        padding: "64px 5vw",
        background: "var(--black)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
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
          Avaliações Reais
        </span>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "2px",
          }}
        >
          O QUE NOSSOS <span style={{ color: "var(--yellow)" }}>CLIENTES DIZEM</span>
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--green), var(--green-light))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.3rem",
                  color: "#fff",
                }}
              >
                {testimonial.avatar}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#fff",
                  }}
                >
                  {testimonial.name}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "rgba(245,245,245,0.45)",
                  }}
                >
                  {testimonial.location}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} style={{ color: "var(--yellow)", fontSize: "0.9rem" }}>
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Text */}
            <p
              style={{
                fontSize: "0.92rem",
                color: "rgba(245,245,245,0.75)",
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              {`"${testimonial.text}"`}
            </p>

            {/* Product */}
            <div
              style={{
                background: "rgba(18,184,58,0.1)",
                border: "1px solid rgba(18,184,58,0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.78rem",
                color: "var(--green-light)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              Comprou: {testimonial.product}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
