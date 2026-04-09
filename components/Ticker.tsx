const items = [
  "FRETE GRÁTIS ACIMA DE R$ 299",
  "PIX COM 5% DE DESCONTO",
  "ENTREGA EM TODO O BRASIL",
  "CAMISAS E TÊNIS PREMIUM",
  "PAGAMENTO 100% SEGURO",
];

export default function Ticker() {
  const doubled = [...items, ...items];
  return (
    <div style={{ background: "var(--green)", padding: "8px 0", overflow: "hidden", borderTop: "2px solid var(--yellow)", borderBottom: "2px solid var(--yellow)" }}>
      <div className="ticker-animate" style={{ display: "flex", whiteSpace: "nowrap", willChange: "transform" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "2.5px", color: "#fff", padding: "0 28px", flexShrink: 0 }}>{item}</span>
            <span style={{ color: "var(--yellow)", fontSize: "0.7rem" }}>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
